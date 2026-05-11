"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { calcularRuta } from "@/app/actions/maps";
import { guardarSalidaPedagogica } from "@/app/actions/trips";
import { getPortalGoogleMapsApiKey, usePortalGoogleMapsLoader } from "@/lib/google-maps";
import { getPmeDimensionByValue } from "@/lib/pme/eid";
import { isValidRut } from "@/lib/validations/salida";
import type {
  DestinationFlow,
  DirectorSchoolProfile,
  PmeDimensionOption,
  RouteCalculationResult,
  RouteStop,
  SchoolOption,
  TripDraftFormValues,
  UserRole,
} from "@/types";

import type { SelectedPlace } from "./LugarAutocomplete";
import StepDestino from "./StepDestino";
import StepDatosViaje from "./StepDatosViaje";
import StepParticipantes from "./StepParticipantes";
import Stepper from "./Stepper";

const steps = [
  {
    id: 1,
    title: "Datos del viaje",
    description: "Fecha, horarios y objetivo pedagogico.",
  },
  {
    id: 2,
    title: "Destino y mapa",
    description: "Busqueda en Google Places y calculo de ruta.",
  },
  {
    id: 3,
    title: "Participantes",
    description: "Participantes responsables y cantidades finales.",
  },
];

const stepOneFields: Array<keyof TripDraftFormValues> = [
  "fecha",
  "hora_salida",
  "hora_regreso",
  "pme_dimension",
  "pme_subdimension",
  "objetivo",
  "actividad",
];

function createEmptyRouteState() {
  return {
    destino_flujo: "single" as const,
    cantidad_destinos: "0",
    lugares_json: "[]",
    lugar_nombre: "",
    lugar_direccion: "",
    lugar_lat: "",
    lugar_lng: "",
    lugar_place_id: "",
    lugar_comuna: "",
    lugar_region: "",
    distancia_km: "",
    distancia_ida_km: "",
    distancia_vuelta_km: "",
    duracion_minutos: "",
    duracion_ida_minutos: "",
    duracion_vuelta_minutos: "",
    ruta_polyline: "",
    ruta_resumen: "",
  };
}

interface NuevaSalidaWizardProps {
  schoolProfile: DirectorSchoolProfile;
  viewerRole: UserRole;
  schoolOptions?: SchoolOption[];
  pmeDimensions: PmeDimensionOption[];
}

export default function NuevaSalidaWizard({ schoolProfile, viewerRole, schoolOptions = [], pmeDimensions }: NuevaSalidaWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [destinationFlow, setDestinationFlow] = useState<DestinationFlow>("single");
  const [selectedPlaces, setSelectedPlaces] = useState<SelectedPlace[]>([]);
  const [routeResult, setRouteResult] = useState<RouteCalculationResult | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);
  const [isRouteLoading, startRouteTransition] = useTransition();
  const [isSaveLoading, startSaveTransition] = useTransition();
  const googleMapsApiKey = getPortalGoogleMapsApiKey();

  const {
    register,
    trigger,
    getValues,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<TripDraftFormValues>({
    mode: "onChange",
    defaultValues: {
      fecha: "",
      hora_salida: "",
      hora_regreso: "",
      pme_dimension: "",
      pme_dimension_label: "",
      pme_dimension_source: "",
      pme_subdimension: "",
      pme_subdimension_label: "",
      cantidad_estudiantes: 1,
      cantidad_apoderados: 0,
      funcionarios: [{ nombre_completo: "", rut: "", cargo: "" }],
      objetivo: "",
      actividad: "",
      lugar_query: "",
      ...createEmptyRouteState(),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "funcionarios",
  });

  const { isLoaded, loadError } = usePortalGoogleMapsLoader();

  const values = watch();
  const minDate = format(new Date(), "yyyy-MM-dd");
  const googleMapsError = !googleMapsApiKey
    ? "Falta configurar NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para habilitar Google Places y el mapa."
    : loadError
      ? "No fue posible cargar Google Maps. Revisa la API key o las APIs habilitadas."
      : null;

  const isStepOneReady =
    values.fecha >= minDate &&
    Boolean(values.hora_salida) &&
    (!values.hora_regreso || values.hora_regreso > values.hora_salida) &&
    Boolean(values.pme_dimension) &&
    Boolean(values.pme_subdimension) &&
    values.objetivo.trim().length >= 10 &&
    values.actividad.trim().length >= 5;
  const isStepThreeReady =
    Number(values.cantidad_estudiantes) >= 1 &&
    Number(values.cantidad_apoderados) >= 0 &&
    values.funcionarios.length >= 1 &&
    values.funcionarios.every(
      (funcionario) =>
        funcionario.nombre_completo.trim().length >= 5 &&
        funcionario.cargo.trim().length >= 3 &&
        isValidRut(funcionario.rut),
    );
  const minimumDestinations = destinationFlow === "multiple" ? 2 : 1;
  const isStepTwoReady = Boolean(
    selectedPlaces.length >= minimumDestinations && values.ruta_polyline && values.distancia_km && values.duracion_minutos,
  );
  const canGoForward = currentStep === 0 ? isStepOneReady : currentStep === 1 ? isStepTwoReady : isStepThreeReady;

  const syncSelectedPlacesToForm = (places: SelectedPlace[]) => {
    const firstPlace = places[0];

    setValue("cantidad_destinos", String(places.length), { shouldDirty: true });
    setValue("lugares_json", JSON.stringify(places), { shouldDirty: true });
    setValue("lugar_nombre", places.map((place) => place.name).join(" | "), { shouldDirty: true });
    setValue("lugar_direccion", places.map((place) => place.address).join(" | "), { shouldDirty: true });
    setValue("lugar_place_id", places.map((place) => place.placeId).join(","), { shouldDirty: true });
    setValue("lugar_comuna", places.map((place) => place.comuna).join(" | "), { shouldDirty: true });
    setValue("lugar_region", places.map((place) => place.region).join(" | "), { shouldDirty: true });
    setValue("lugar_lat", firstPlace ? String(firstPlace.lat) : "", { shouldDirty: true });
    setValue("lugar_lng", firstPlace ? String(firstPlace.lng) : "", { shouldDirty: true });
  };

  const clearComputedRouteState = () => {
    setRouteResult(null);
    setValue("distancia_km", "", { shouldDirty: true });
    setValue("distancia_ida_km", "", { shouldDirty: true });
    setValue("distancia_vuelta_km", "", { shouldDirty: true });
    setValue("duracion_minutos", "", { shouldDirty: true });
    setValue("duracion_ida_minutos", "", { shouldDirty: true });
    setValue("duracion_vuelta_minutos", "", { shouldDirty: true });
    setValue("ruta_polyline", "", { shouldDirty: true });
    setValue("ruta_resumen", "", { shouldDirty: true });
  };

  const resetRouteFields = (flow: DestinationFlow = destinationFlow) => {
    const emptyState = createEmptyRouteState();

    Object.entries(emptyState).forEach(([key, value]) => {
      setValue(key as keyof TripDraftFormValues, value, { shouldValidate: false, shouldDirty: true });
    });

    setValue("destino_flujo", flow, { shouldDirty: true });
    setSelectedPlaces([]);
    clearComputedRouteState();
    setRouteError(null);
  };

  const applyRouteResult = (places: SelectedPlace[], route: RouteCalculationResult) => {
    setRouteResult(route);
    setValue("distancia_km", String(route.distancia_km), { shouldDirty: true });
    setValue("distancia_ida_km", String(route.distancia_ida_km), { shouldDirty: true });
    setValue("distancia_vuelta_km", String(route.distancia_vuelta_km), { shouldDirty: true });
    setValue("duracion_minutos", String(route.duracion_minutos), { shouldDirty: true });
    setValue("duracion_ida_minutos", String(route.duracion_ida_minutos), { shouldDirty: true });
    setValue("duracion_vuelta_minutos", String(route.duracion_vuelta_minutos), { shouldDirty: true });
    setValue("ruta_polyline", route.polyline, { shouldDirty: true });
    setValue("ruta_resumen", route.resumen, { shouldDirty: true });
    syncSelectedPlacesToForm(places);
  };

  const recalculateRoute = (places: SelectedPlace[]) => {
    syncSelectedPlacesToForm(places);
    clearComputedRouteState();
    setRouteError(null);

    if (!places.length) {
      return;
    }

    const stops: RouteStop[] = places.map((place) => ({
      placeId: place.placeId,
      name: place.name,
      address: place.address,
      comuna: place.comuna,
      region: place.region,
      lat: place.lat,
      lng: place.lng,
    }));

    startRouteTransition(() => {
      void (async () => {
        try {
          const result = await calcularRuta({
            origen: {
              lat: schoolProfile.latitud,
              lng: schoolProfile.longitud,
            },
            destinos: stops,
          });

          if (!result.route) {
            throw new Error(result.error ?? "No fue posible calcular la ruta para los destinos seleccionados.");
          }

          applyRouteResult(places, result.route);
        } catch (error) {
          clearComputedRouteState();
          setRouteError(error instanceof Error ? error.message : "No fue posible calcular la ruta para los destinos seleccionados.");
        }
      })();
    });
  };

  const handleDestinationQueryChange = (value: string) => {
    setValue("lugar_query", value, { shouldDirty: true });

    if (destinationFlow === "single" && selectedPlaces.length > 0) {
      setSelectedPlaces([]);
      syncSelectedPlacesToForm([]);
      clearComputedRouteState();
      setRouteError(null);
    }
  };

  const handleSelectPlace = (place: SelectedPlace) => {
    const nextPlaces =
      destinationFlow === "single"
        ? [place]
        : [...selectedPlaces.filter((selectedPlace) => selectedPlace.placeId !== place.placeId), place];

    setSelectedPlaces(nextPlaces);
    setValue("lugar_query", destinationFlow === "single" ? place.name : "", { shouldDirty: true });
    recalculateRoute(nextPlaces);
  };

  const handleRemoveDestination = (placeId: string) => {
    const nextPlaces = selectedPlaces.filter((place) => place.placeId !== placeId);

    setSelectedPlaces(nextPlaces);
    setValue("lugar_query", "", { shouldDirty: true });
    recalculateRoute(nextPlaces);
  };

  const handleDestinationFlowChange = (flow: DestinationFlow) => {
    setDestinationFlow(flow);
    setValue("lugar_query", "", { shouldDirty: true });
    resetRouteFields(flow);
  };

  const handlePmeDimensionChange = (dimensionValue: string) => {
    const selectedDimension = getPmeDimensionByValue(pmeDimensions, dimensionValue);

    setValue("pme_dimension", dimensionValue, { shouldDirty: true, shouldValidate: true });
    setValue("pme_dimension_label", selectedDimension?.label ?? "", { shouldDirty: true });
    setValue("pme_dimension_source", selectedDimension?.sourceDimension ?? "", { shouldDirty: true });
    setValue("pme_subdimension", "", { shouldDirty: true, shouldValidate: true });
    setValue("pme_subdimension_label", "", { shouldDirty: true });
  };

  const handlePmeSubdimensionChange = (subdimensionValue: string) => {
    const selectedDimension = getPmeDimensionByValue(pmeDimensions, values.pme_dimension);
    const selectedSubdimension = selectedDimension?.subdimensions.find((subdimension) => subdimension.value === subdimensionValue) ?? null;

    setValue("pme_subdimension", subdimensionValue, { shouldDirty: true, shouldValidate: true });
    setValue("pme_subdimension_label", selectedSubdimension?.label ?? "", { shouldDirty: true });
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      const isValid = await trigger(stepOneFields);

      if (isValid) {
        setCurrentStep(1);
      }

      return;
    }

    if (currentStep === 1 && isStepTwoReady) {
      setCurrentStep(2);
      setSaveError(null);
      setSaveSuccessId(null);
      return;
    }

    if (currentStep === 2) {
      const isValid = await trigger(["cantidad_estudiantes", "cantidad_apoderados", "funcionarios"]);

      if (!isValid) {
        return;
      }

      setSaveError(null);
      setSaveSuccessId(null);

      startSaveTransition(() => {
        void (async () => {
          const result = await guardarSalidaPedagogica({
            rbd: schoolProfile.rbd,
            fecha: getValues("fecha"),
            hora_salida: getValues("hora_salida"),
            hora_regreso: getValues("hora_regreso"),
            pme_dimension: getValues("pme_dimension_source") || getValues("pme_dimension_label"),
            pme_subdimension: getValues("pme_subdimension_label"),
            objetivo: getValues("objetivo"),
            actividad: getValues("actividad"),
            lugar_nombre: getValues("lugar_nombre"),
            lugar_direccion: getValues("lugar_direccion"),
            lugar_lat: getValues("lugar_lat"),
            lugar_lng: getValues("lugar_lng"),
            lugar_place_id: getValues("lugar_place_id"),
            lugar_comuna: getValues("lugar_comuna"),
            lugar_region: getValues("lugar_region"),
            distancia_km: getValues("distancia_km"),
            distancia_ida_km: getValues("distancia_ida_km"),
            distancia_vuelta_km: getValues("distancia_vuelta_km"),
            duracion_minutos: getValues("duracion_minutos"),
            duracion_ida_minutos: getValues("duracion_ida_minutos"),
            duracion_vuelta_minutos: getValues("duracion_vuelta_minutos"),
            ruta_polyline: getValues("ruta_polyline"),
            ruta_resumen: getValues("ruta_resumen"),
            ruta_segmentos: routeResult?.segmentos ?? [],
            cantidad_estudiantes: getValues("cantidad_estudiantes"),
            cantidad_apoderados: getValues("cantidad_apoderados"),
            funcionarios: getValues("funcionarios"),
          });

          if (result.error || !result.tripId) {
            setSaveError(result.error ?? "No fue posible guardar la salida pedagogica.");
            return;
          }

          setSaveSuccessId(result.tripId);
          router.push(`/nueva-salida/exito?id=${encodeURIComponent(result.tripId)}`);
        })();
      });
    }
  };

  const isAdminView = viewerRole === "admin";

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Formulario de salida</p>
            <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950">Nueva salida pedagogica</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              {isAdminView
                ? "Estas revisando el mismo formulario operativo que utilizan los directores, usando un establecimiento real seleccionado por administracion."
                : "El establecimiento de origen se detecta automaticamente desde la whitelist del director. En esta fase quedan operativos los pasos de datos del viaje, destino, resumen y mapa de ruta."}
            </p>
            {isAdminView && schoolOptions.length > 0 ? (
              <div className="mt-6 max-w-md">
                <label className="block text-sm font-semibold text-slate-800">Establecimiento a visualizar</label>
                <select
                  value={schoolProfile.rbd}
                  onChange={(event) => router.push(`/nueva-salida?rbd=${encodeURIComponent(event.target.value)}`)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
                >
                  {schoolOptions.map((schoolOption) => (
                    <option key={schoolOption.rbd} value={schoolOption.rbd}>
                      {schoolOption.nombre} · {schoolOption.comuna}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-4 lg:items-end">
            {isAdminView ? (
              <Link
                href="/panel"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slep hover:text-slep"
              >
                Volver a panel admin
              </Link>
            ) : null}
            <div className="rounded-[24px] border border-slep/20 bg-slep/5 px-5 py-4 text-sm leading-6 text-slate-700">
              <p className="font-semibold text-slate-950">{isAdminView ? "Establecimiento seleccionado" : "Establecimiento asignado"}</p>
              <p className="mt-1">{schoolProfile.nombre}</p>
              <p>{schoolProfile.comuna} · RBD {schoolProfile.rbd}</p>
            </div>
          </div>
        </div>
      </div>

      <form className="space-y-6">
        <input type="hidden" {...register("lugar_query")} />
        <input type="hidden" {...register("destino_flujo")} />
        <input type="hidden" {...register("cantidad_destinos")} />
        <input type="hidden" {...register("lugares_json")} />
        <input type="hidden" {...register("lugar_nombre")} />
        <input type="hidden" {...register("lugar_direccion")} />
        <input type="hidden" {...register("lugar_lat")} />
        <input type="hidden" {...register("lugar_lng")} />
        <input type="hidden" {...register("lugar_place_id")} />
        <input type="hidden" {...register("lugar_comuna")} />
        <input type="hidden" {...register("lugar_region")} />
        <input type="hidden" {...register("distancia_km")} />
        <input type="hidden" {...register("distancia_ida_km")} />
        <input type="hidden" {...register("distancia_vuelta_km")} />
        <input type="hidden" {...register("duracion_minutos")} />
        <input type="hidden" {...register("duracion_ida_minutos")} />
        <input type="hidden" {...register("duracion_vuelta_minutos")} />
        <input type="hidden" {...register("ruta_polyline")} />
        <input type="hidden" {...register("ruta_resumen")} />

        {currentStep === 0 ? (
          <StepDatosViaje
            register={register}
            errors={errors}
            minDate={minDate}
            pmeDimensions={pmeDimensions}
            selectedDimension={values.pme_dimension}
            onDimensionChange={handlePmeDimensionChange}
            onSubdimensionChange={handlePmeSubdimensionChange}
          />
        ) : null}

        {currentStep === 1 ? (
          <StepDestino
            schoolProfile={schoolProfile}
            destinationFlow={destinationFlow}
            destinationQuery={values.lugar_query}
            destinations={selectedPlaces}
            routeResult={routeResult}
            isGoogleMapsReady={isLoaded}
            isRouteLoading={isRouteLoading}
            routeError={routeError}
            googleMapsError={googleMapsError}
            onDestinationFlowChange={handleDestinationFlowChange}
            onDestinationQueryChange={handleDestinationQueryChange}
            onSelectPlace={handleSelectPlace}
            onResetPlace={() => {
              resetRouteFields();
              setValue("lugar_query", "", { shouldDirty: true });
            }}
            onRemoveDestination={handleRemoveDestination}
          />
        ) : null}

        {currentStep === 2 ? (
          <div className="space-y-6">
            <StepParticipantes register={register} setValue={setValue} errors={errors} fields={fields} append={append} remove={remove} />

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Resumen final</p>
              <h3 className="font-display mt-3 text-2xl font-semibold text-slate-950">Informacion consolidada</h3>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Verifica los datos del PME, la accion, la ruta y los participantes antes de guardar la salida definitiva.
              </p>
              <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-sm leading-6 text-slate-700">
                <p className="font-semibold text-slate-950">Resumen preparado</p>
                <p className="mt-2">Fecha: {getValues("fecha") || "-"}</p>
                <p>Hora salida: {getValues("hora_salida") || "-"}</p>
                <p>Dimension PME: {getValues("pme_dimension_label") || "-"}</p>
                <p>Subdimension PME: {getValues("pme_subdimension_label") || "-"}</p>
                <p>Nombre de la accion: {getValues("actividad") || "-"}</p>
                <p>Flujo: {destinationFlow === "multiple" ? "Multiples destinos" : "Un destino"}</p>
                <p>Destino{selectedPlaces.length > 1 ? "s" : ""}: {getValues("lugar_nombre") || "-"}</p>
                <p>Estudiantes: {getValues("cantidad_estudiantes") || 0}</p>
                <p>Apoderados: {getValues("cantidad_apoderados") || 0}</p>
                <p>Funcionarios: {getValues("funcionarios")?.length ?? 0}</p>
                <p>Ida: {getValues("distancia_ida_km") || "-"} km</p>
                <p>Vuelta: {getValues("distancia_vuelta_km") || "-"} km</p>
                <p>Total: {getValues("distancia_km") || "-"} km</p>
              </div>

              {saveError ? (
                <div className="status-card-danger mt-6 rounded-2xl px-4 py-3 text-sm">
                  {saveError}
                </div>
              ) : null}

              {saveSuccessId ? (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  La salida fue guardada correctamente con ID {saveSuccessId}.
                </div>
              ) : null}
            </section>
          </div>
        ) : null}

        <Stepper
          steps={steps}
          currentStep={currentStep}
          canGoBack={currentStep > 0}
          canGoForward={currentStep === 2 ? !Boolean(saveSuccessId) : canGoForward}
          isFinalStep={currentStep === steps.length - 1}
          isBusy={(currentStep === 1 && isRouteLoading) || (currentStep === 2 && isSaveLoading)}
          busyLabel={currentStep === 2 ? "Guardando la salida pedagogica en Supabase..." : "Consultando Google Maps y preparando el resumen del trayecto..."}
          helperText={currentStep === 2 ? "Guarda la salida para persistir fecha, PME, accion, objetivo y datos de ruta en la base de datos." : undefined}
          nextLabel={currentStep === 2 ? (saveSuccessId ? "Guardada" : "Guardar salida") : undefined}
          onPrevious={() => setCurrentStep((previousStep) => Math.max(0, previousStep - 1))}
          onNext={() => void handleNext()}
        />
      </form>
    </section>
  );
}
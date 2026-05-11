"use client";

import { format } from "date-fns";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useJsApiLoader } from "@react-google-maps/api";
import { useRouter } from "next/navigation";

import { calcularRuta } from "@/app/actions/maps";
import type { DirectorSchoolProfile, RouteCalculationResult, SchoolOption, TripDraftFormValues, UserRole } from "@/types";

import type { SelectedPlace } from "./LugarAutocomplete";
import StepDestino from "./StepDestino";
import StepDatosViaje from "./StepDatosViaje";
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
    description: "Se habilita en la siguiente fase del desarrollo.",
  },
];

const googleLibraries: ["places"] = ["places"];
const stepOneFields: Array<keyof TripDraftFormValues> = ["fecha", "hora_salida", "hora_regreso", "objetivo", "actividad"];

function createEmptyRouteState() {
  return {
    lugar_nombre: "",
    lugar_direccion: "",
    lugar_lat: "",
    lugar_lng: "",
    lugar_place_id: "",
    lugar_comuna: "",
    lugar_region: "",
    distancia_km: "",
    duracion_minutos: "",
    ruta_polyline: "",
    ruta_resumen: "",
  };
}

interface NuevaSalidaWizardProps {
  schoolProfile: DirectorSchoolProfile;
  viewerRole: UserRole;
  schoolOptions?: SchoolOption[];
}

export default function NuevaSalidaWizard({ schoolProfile, viewerRole, schoolOptions = [] }: NuevaSalidaWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [routeResult, setRouteResult] = useState<RouteCalculationResult | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isRouteLoading, startRouteTransition] = useTransition();
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  const {
    register,
    trigger,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TripDraftFormValues>({
    mode: "onChange",
    defaultValues: {
      fecha: "",
      hora_salida: "",
      hora_regreso: "",
      objetivo: "",
      actividad: "",
      lugar_query: "",
      ...createEmptyRouteState(),
    },
  });

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-maps-script",
    googleMapsApiKey,
    libraries: googleLibraries,
  });

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
    values.objetivo.trim().length >= 10 &&
    values.actividad.trim().length >= 5;
  const isStepTwoReady = Boolean(values.lugar_place_id && values.ruta_polyline && values.distancia_km && values.duracion_minutos);
  const canGoForward = currentStep === 0 ? isStepOneReady : currentStep === 1 ? isStepTwoReady : false;

  const resetRouteFields = () => {
    const emptyState = createEmptyRouteState();

    Object.entries(emptyState).forEach(([key, value]) => {
      setValue(key as keyof TripDraftFormValues, value, { shouldValidate: false, shouldDirty: true });
    });

    setSelectedPlace(null);
    setRouteResult(null);
    setRouteError(null);
  };

  const handleDestinationQueryChange = (value: string) => {
    setValue("lugar_query", value, { shouldDirty: true });

    if (selectedPlace) {
      resetRouteFields();
      setValue("lugar_query", value, { shouldDirty: true });
    }
  };

  const handleSelectPlace = (place: SelectedPlace) => {
    setSelectedPlace(place);
    setRouteResult(null);
    setRouteError(null);
    setValue("lugar_query", place.name, { shouldDirty: true });
    setValue("lugar_nombre", place.name, { shouldDirty: true });
    setValue("lugar_direccion", place.address, { shouldDirty: true });
    setValue("lugar_lat", String(place.lat), { shouldDirty: true });
    setValue("lugar_lng", String(place.lng), { shouldDirty: true });
    setValue("lugar_place_id", place.placeId, { shouldDirty: true });
    setValue("lugar_comuna", place.comuna, { shouldDirty: true });
    setValue("lugar_region", place.region, { shouldDirty: true });

    startRouteTransition(() => {
      void (async () => {
        try {
          const route = await calcularRuta({
            origen: {
              lat: schoolProfile.latitud,
              lng: schoolProfile.longitud,
            },
            destino: {
              lat: place.lat,
              lng: place.lng,
            },
          });

          setRouteResult(route);
          setValue("distancia_km", String(route.distancia_km), { shouldDirty: true });
          setValue("duracion_minutos", String(route.duracion_minutos), { shouldDirty: true });
          setValue("ruta_polyline", route.polyline, { shouldDirty: true });
          setValue("ruta_resumen", route.resumen, { shouldDirty: true });
        } catch (error) {
          setRouteResult(null);
          setValue("distancia_km", "", { shouldDirty: true });
          setValue("duracion_minutos", "", { shouldDirty: true });
          setValue("ruta_polyline", "", { shouldDirty: true });
          setValue("ruta_resumen", "", { shouldDirty: true });
          setRouteError(error instanceof Error ? error.message : "No fue posible calcular la ruta para el destino seleccionado.");
        }
      })();
    });
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
          <div className="rounded-[24px] border border-slep/20 bg-slep/5 px-5 py-4 text-sm leading-6 text-slate-700">
            <p className="font-semibold text-slate-950">{isAdminView ? "Establecimiento seleccionado" : "Establecimiento asignado"}</p>
            <p className="mt-1">{schoolProfile.nombre}</p>
            <p>{schoolProfile.comuna} · RBD {schoolProfile.rbd}</p>
          </div>
        </div>
      </div>

      <form className="space-y-6">
        <input type="hidden" {...register("lugar_query")} />
        <input type="hidden" {...register("lugar_nombre")} />
        <input type="hidden" {...register("lugar_direccion")} />
        <input type="hidden" {...register("lugar_lat")} />
        <input type="hidden" {...register("lugar_lng")} />
        <input type="hidden" {...register("lugar_place_id")} />
        <input type="hidden" {...register("lugar_comuna")} />
        <input type="hidden" {...register("lugar_region")} />
        <input type="hidden" {...register("distancia_km")} />
        <input type="hidden" {...register("duracion_minutos")} />
        <input type="hidden" {...register("ruta_polyline")} />
        <input type="hidden" {...register("ruta_resumen")} />

        {currentStep === 0 ? <StepDatosViaje register={register} errors={errors} minDate={minDate} /> : null}

        {currentStep === 1 ? (
          <StepDestino
            schoolProfile={schoolProfile}
            destinationQuery={values.lugar_query}
            selectedPlace={selectedPlace}
            routeResult={routeResult}
            isGoogleMapsReady={isLoaded}
            isRouteLoading={isRouteLoading}
            routeError={routeError}
            googleMapsError={googleMapsError}
            onDestinationQueryChange={handleDestinationQueryChange}
            onSelectPlace={handleSelectPlace}
            onResetPlace={() => {
              resetRouteFields();
              setValue("lugar_query", "", { shouldDirty: true });
            }}
          />
        ) : null}

        {currentStep === 2 ? (
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Paso 3</p>
            <h3 className="font-display mt-3 text-2xl font-semibold text-slate-950">Participantes y envio</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Este paso queda reservado para la Fase 3. El stepper y los datos previos ya quedaron preparados para conectar validacion final, lista de funcionarios y submit al servidor sin rehacer la UX.
            </p>
            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-sm leading-6 text-slate-700">
              <p className="font-semibold text-slate-950">Resumen preparado</p>
              <p className="mt-2">Fecha: {getValues("fecha") || "-"}</p>
              <p>Hora salida: {getValues("hora_salida") || "-"}</p>
              <p>Destino: {getValues("lugar_nombre") || "-"}</p>
              <p>Distancia: {getValues("distancia_km") || "-"} km</p>
            </div>
          </section>
        ) : null}

        <Stepper
          steps={steps}
          currentStep={currentStep}
          canGoBack={currentStep > 0}
          canGoForward={canGoForward}
          isFinalStep={currentStep === steps.length - 1}
          onPrevious={() => setCurrentStep((previousStep) => Math.max(0, previousStep - 1))}
          onNext={() => void handleNext()}
        />
      </form>
    </section>
  );
}
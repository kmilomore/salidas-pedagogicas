import type { DirectorSchoolProfile, RouteCalculationResult } from "@/types";

import DistanciaResumen from "./DistanciaResumen";
import LugarAutocomplete, { type SelectedPlace } from "./LugarAutocomplete";
import MapaRuta from "./MapaRuta";

interface StepDestinoProps {
  schoolProfile: DirectorSchoolProfile;
  destinationQuery: string;
  selectedPlace: SelectedPlace | null;
  routeResult: RouteCalculationResult | null;
  isGoogleMapsReady: boolean;
  isRouteLoading: boolean;
  routeError: string | null;
  googleMapsError: string | null;
  onDestinationQueryChange: (value: string) => void;
  onSelectPlace: (place: SelectedPlace) => void;
  onResetPlace: () => void;
}

function RouteSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 rounded-full bg-slate-200" />
        <div className="h-[360px] rounded-[24px] bg-slate-200" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-20 rounded-[20px] bg-slate-200" />
          <div className="h-20 rounded-[20px] bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function StepDestino({
  schoolProfile,
  destinationQuery,
  selectedPlace,
  routeResult,
  isGoogleMapsReady,
  isRouteLoading,
  routeError,
  googleMapsError,
  onDestinationQueryChange,
  onSelectPlace,
  onResetPlace,
}: StepDestinoProps) {
  const showRoute = Boolean(selectedPlace && routeResult);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Paso 2</p>
      <h3 className="font-display mt-3 text-2xl font-semibold text-slate-950">Destino y ruta</h3>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
        El destino solo queda validado cuando proviene del selector de Google Places. Al confirmarlo, la aplicacion calcula la ruta desde el establecimiento asociado al director.
      </p>

      <div className="mt-8 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-6 rounded-[24px] border border-slate-200 bg-slate-50 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Origen detectado</p>
            <h4 className="mt-3 text-xl font-semibold text-slate-950">{schoolProfile.nombre}</h4>
            <p className="mt-2 text-sm leading-6 text-slate-600">{schoolProfile.direccion}</p>
            <p className="mt-1 text-sm text-slate-600">{schoolProfile.comuna} · RBD {schoolProfile.rbd}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-800">Buscar destino</label>
            {googleMapsError ? (
              <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {googleMapsError}
              </div>
            ) : (
              <div className="mt-3">
                <LugarAutocomplete
                  value={destinationQuery}
                  selectedPlace={selectedPlace}
                  onChange={onDestinationQueryChange}
                  onSelect={onSelectPlace}
                  onReset={onResetPlace}
                  disabled={!isGoogleMapsReady || isRouteLoading}
                />
              </div>
            )}
          </div>

          <div className="rounded-[20px] bg-white p-4 text-sm leading-6 text-slate-600">
            <p className="font-semibold text-slate-950">Requisitos del paso</p>
            <p className="mt-2">
              Debes confirmar un lugar valido desde el dropdown de Google Places. El boton Siguiente se habilita cuando existe un place id valido y la ruta ya fue calculada.
            </p>
          </div>
        </aside>

        <div className={["overflow-hidden transition-all duration-500 ease-out", showRoute || isRouteLoading || Boolean(routeError) ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"].join(" ")}>
          {isRouteLoading ? <RouteSkeleton /> : null}

          {!isRouteLoading && routeError ? (
            <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-6 text-sm leading-6 text-rose-700">
              {routeError}
            </div>
          ) : null}

          {!isRouteLoading && selectedPlace && routeResult ? (
            <div className="space-y-6">
              <MapaRuta schoolProfile={schoolProfile} destination={selectedPlace} route={routeResult} />
              <DistanciaResumen schoolProfile={schoolProfile} destination={selectedPlace} route={routeResult} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
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

function RouteLoader({ destinationName }: { destinationName: string | null }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slep/15 bg-[linear-gradient(135deg,rgba(27,79,138,0.08),rgba(255,255,255,0.96)_35%,rgba(217,232,247,0.7))] p-6 shadow-soft">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slep">Calculando ruta</p>
          <h4 className="font-display mt-3 text-2xl font-semibold text-slate-950">Preparando mapa, distancia y tiempo estimado</h4>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {destinationName
              ? `Estamos consultando Google Maps para obtener la ruta real hacia ${destinationName}.`
              : "Estamos consultando Google Maps para obtener la ruta real del trayecto seleccionado."}
          </p>
        </div>

        <div className="flex items-center justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-slep/15 bg-white/80 shadow-lg shadow-slep/10">
            <div className="absolute h-24 w-24 animate-ping rounded-full bg-slep/10" />
            <div className="h-14 w-14 animate-spin rounded-full border-[5px] border-slep/20 border-t-slep" />
            <div className="absolute h-3 w-3 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <div className="rounded-[24px] border border-white/70 bg-white/85 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">Trazando recorrido</p>
              <p className="mt-1 text-sm text-slate-600">Origen institucional, destino confirmado y polilinea del trayecto.</p>
            </div>
            <span className="rounded-full bg-slep/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slep">En proceso</span>
          </div>
          <div className="mt-5 h-[280px] rounded-[20px] bg-[linear-gradient(180deg,#eff6ff_0%,#dbeafe_46%,#eff6ff_100%)] p-5">
            <div className="flex h-full flex-col justify-between rounded-[18px] border border-white/70 bg-white/45 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-slep" />
                <div className="h-3 w-40 rounded-full bg-slep/15" />
              </div>
              <div className="space-y-4">
                <div className="h-2 rounded-full bg-slep/10" />
                <div className="h-2 w-11/12 rounded-full bg-slep/15" />
                <div className="h-2 w-10/12 rounded-full bg-slep/10" />
                <div className="h-2 w-9/12 rounded-full bg-slep/15" />
              </div>
              <div className="flex items-center justify-end gap-3">
                <div className="h-3 w-20 rounded-full bg-emerald-200" />
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {["Validando coordenadas del establecimiento", "Consultando Google Directions", "Preparando resumen del trayecto"].map((item, index) => (
            <div key={item} className="rounded-[22px] border border-white/70 bg-white/85 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slep/10 text-xs font-semibold text-slep">
                  0{index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{item}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/80">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-[linear-gradient(90deg,#1B4F8A,#5f8fcb)]" />
                  </div>
                </div>
              </div>
            </div>
          ))}
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
          {isRouteLoading ? <RouteLoader destinationName={selectedPlace?.name ?? null} /> : null}

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
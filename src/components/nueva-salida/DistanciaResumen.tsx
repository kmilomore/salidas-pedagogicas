import type { DirectorSchoolProfile, RouteCalculationResult } from "@/types";

import type { SelectedPlace } from "./LugarAutocomplete";

interface DistanciaResumenProps {
  schoolProfile: DirectorSchoolProfile;
  destinations: SelectedPlace[];
  route: RouteCalculationResult;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!hours) {
    return `${remainingMinutes} min`;
  }

  if (!remainingMinutes) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}

export default function DistanciaResumen({ schoolProfile, destinations, route }: DistanciaResumenProps) {
  const destinationLabel =
    destinations.length === 1
      ? `${destinations[0].name}, ${destinations[0].region}`
      : `${destinations.length} destinos confirmados en el circuito`;

  return (
    <div className="portal-section-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slep">Ruta calculada</p>
          <h4 className="font-display mt-3 text-2xl font-semibold text-slate-950">Resumen operativo del recorrido</h4>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Se consolida el kilometraje referencial total, el desglose de ida y vuelta y los puntos efectivamente considerados en el trazado.
          </p>
        </div>
        <div className="portal-card-subtle px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-950">Origen institucional</p>
          <p className="mt-1">{schoolProfile.nombre}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-4">
        <div className="portal-card-subtle">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Destinos</p>
          <p className="mt-2 text-sm leading-6 text-slate-800">{destinationLabel}</p>
        </div>
        <div className="portal-card-subtle bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ida</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{route.distancia_ida_km} km</p>
          <p className="mt-1 text-sm text-slate-600">{formatDuration(route.duracion_ida_minutos)}</p>
        </div>
        <div className="portal-card-subtle bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Vuelta</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{route.distancia_vuelta_km} km</p>
          <p className="mt-1 text-sm text-slate-600">{formatDuration(route.duracion_vuelta_minutos)}</p>
        </div>
        <div className="portal-card-subtle bg-[linear-gradient(180deg,#ecfdf5_0%,#ffffff_100%)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{route.distancia_km} km</p>
          <p className="mt-1 text-sm text-slate-600">{formatDuration(route.duracion_minutos)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="portal-card-subtle p-5 text-sm leading-6 text-slate-700">
          <p className="font-semibold text-slate-950">Via principal y trazado</p>
          <p className="mt-2">{route.resumen}</p>
        </div>
        <div className="portal-card-subtle p-5 text-sm leading-6 text-slate-700">
          <p className="font-semibold text-slate-950">Puntos confirmados</p>
          <div className="mt-2 space-y-1">
            {destinations.map((destination, index) => (
              <div key={destination.placeId}>
                {index + 1}. {destination.name} · {destination.comuna}, {destination.region}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
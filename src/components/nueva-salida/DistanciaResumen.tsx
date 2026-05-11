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
    <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Recorrido confirmado</p>
      <div className="mt-4 grid gap-3 text-sm leading-6 sm:grid-cols-2">
        <p>Destinos: {destinationLabel}</p>
        <p>Origen: {schoolProfile.nombre}</p>
        <p>Ida referencial: {route.distancia_ida_km} km</p>
        <p>Vuelta referencial: {route.distancia_vuelta_km} km</p>
        <p>Total referencial: {route.distancia_km} km</p>
        <p>Tiempo ida: {formatDuration(route.duracion_ida_minutos)}</p>
        <p>Tiempo vuelta: {formatDuration(route.duracion_vuelta_minutos)}</p>
        <p>Tiempo total estimado: {formatDuration(route.duracion_minutos)}</p>
        <p>Via principal: {route.resumen}</p>
      </div>
    </div>
  );
}
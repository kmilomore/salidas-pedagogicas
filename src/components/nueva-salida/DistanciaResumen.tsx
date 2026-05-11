import type { DirectorSchoolProfile, RouteCalculationResult } from "@/types";

import type { SelectedPlace } from "./LugarAutocomplete";

interface DistanciaResumenProps {
  schoolProfile: DirectorSchoolProfile;
  destination: SelectedPlace;
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

export default function DistanciaResumen({ schoolProfile, destination, route }: DistanciaResumenProps) {
  return (
    <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Destino confirmado</p>
      <div className="mt-4 grid gap-3 text-sm leading-6 sm:grid-cols-2">
        <p>Destino: {destination.name}, {destination.region}</p>
        <p>Distancia: {route.distancia_km} km desde {schoolProfile.nombre}</p>
        <p>Tiempo estimado: {formatDuration(route.duracion_minutos)}</p>
        <p>Via principal: {route.resumen}</p>
      </div>
    </div>
  );
}
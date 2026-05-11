import type { AdminTripRecord } from "@/types";

export function formatTripDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function formatDistance(value: number) {
  return `${Number(value ?? 0).toFixed(1)} km`;
}

export function getStatusLabel(status: AdminTripRecord["estado"]) {
  return status === "enviada" ? "Enviada" : "Borrador";
}

export function getStatusClasses(status: AdminTripRecord["estado"]) {
  return status === "enviada"
    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : "border-amber-200 bg-amber-50 text-amber-900";
}
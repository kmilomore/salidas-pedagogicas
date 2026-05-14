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
    ? "portal-chip portal-chip--success"
    : "portal-chip portal-chip--warning";
}
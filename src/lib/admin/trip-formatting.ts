import { formatChileDateFromIsoDate } from "@/lib/date-time";
import type { AdminTripRecord } from "@/types";

export function getTripPassengerTotals(trip: Pick<AdminTripRecord, "cantidad_estudiantes" | "cantidad_apoderados" | "funcionarios">) {
  const cantidadFuncionarios = trip.funcionarios.length;
  const cantidadTotalPasajeros = trip.cantidad_estudiantes + trip.cantidad_apoderados + cantidadFuncionarios;

  return {
    cantidadFuncionarios,
    cantidadTotalPasajeros,
  };
}

export function formatTripDate(value: string) {
  return formatChileDateFromIsoDate(value);
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
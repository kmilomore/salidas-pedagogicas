import { formatChileDateFromIsoDate } from "@/lib/date-time";
import type { AdminDecisionStatus, AdminTransportMode, AdminTripRecord } from "@/types";

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

export function formatAdminCurrency(value: number | null) {
  if (value === null) {
    return "Sin definir";
  }

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getAdminTransportLabel(transportMode: AdminTransportMode | null) {
  switch (transportMode) {
    case "taxi_bus":
      return "Taxi bus";
    case "bus":
      return "Bus";
    default:
      return "Sin definir";
  }
}

export function getStatusLabel(status: AdminTripRecord["estado"]) {
  return status === "enviada" ? "Enviada" : "Borrador";
}

export function getStatusClasses(status: AdminTripRecord["estado"]) {
  return status === "enviada"
    ? "portal-chip portal-chip--success"
    : "portal-chip portal-chip--warning";
}

export function getAdminDecisionLabel(decision: AdminDecisionStatus) {
  switch (decision) {
    case "aceptada":
      return "Aceptada";
    case "rechazada":
      return "Rechazada";
    default:
      return "Pendiente";
  }
}

export function getAdminDecisionClasses(decision: AdminDecisionStatus) {
  switch (decision) {
    case "aceptada":
      return "portal-chip portal-chip--success";
    case "rechazada":
      return "portal-chip portal-chip--danger";
    default:
      return "portal-chip portal-chip--info";
  }
}
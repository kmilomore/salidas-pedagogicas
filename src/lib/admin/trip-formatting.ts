import { formatChileDateFromIsoDate } from "@/lib/date-time";
import type { AdminDecisionStatus, AdminStageStatus, AdminTransportMode, AdminTripRecord } from "@/types";

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

export function getAdminStageLabel(stage: AdminStageStatus) {
  switch (stage) {
    case "etapa_1":
      return "Etapa 1";
    case "etapa_2":
      return "Etapa 2";
    case "terminada":
      return "Terminada";
    case "seleccionada":
      return "Seleccionada";
    default:
      return "Pendiente";
  }
}

export function getAdminStageClasses(stage: AdminStageStatus) {
  switch (stage) {
    case "etapa_1":
      return "portal-chip portal-chip--info";
    case "etapa_2":
      return "portal-chip border border-sky-200 bg-sky-50 text-sky-800";
    case "terminada":
      return "portal-chip border border-violet-200 bg-violet-50 text-violet-800";
    case "seleccionada":
      return "portal-chip portal-chip--success";
    default:
      return "portal-chip portal-chip--warning";
  }
}
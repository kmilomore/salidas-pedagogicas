"use client";

import { useMemo, useState } from "react";

import {
  formatTripDate,
  getAdminDecisionClasses,
  getAdminDecisionLabel,
  getAdminStageClasses,
  getAdminStageLabel,
  getTripPassengerTotals,
} from "@/lib/admin/trip-formatting";
import type { AdminTripRecord } from "@/types";

import DetalleSalida from "./DetalleSalida";

interface AdminTripsKanbanProps {
  trips: AdminTripRecord[];
}

interface KanbanColumn {
  key: "pendientes" | "en_proceso" | "aceptadas";
  title: string;
  description: string;
  emptyMessage: string;
  accentClassName: string;
  trips: AdminTripRecord[];
}

function buildKanbanColumns(trips: AdminTripRecord[]): KanbanColumn[] {
  const pendingTrips = trips.filter((trip) => trip.decision_admin === "pendiente" && trip.etapa_admin === "pendiente");
  const inProgressTrips = trips.filter((trip) => trip.decision_admin === "pendiente" && trip.etapa_admin !== "pendiente");
  const acceptedTrips = trips.filter((trip) => trip.decision_admin === "aceptada");

  return [
    {
      key: "pendientes",
      title: "Pendientes",
      description: "Salidas aun no procesadas administrativamente.",
      emptyMessage: "No hay salidas pendientes con los filtros actuales.",
      accentClassName: "border-amber-200 bg-amber-50 text-amber-800",
      trips: pendingTrips,
    },
    {
      key: "en_proceso",
      title: "En proceso",
      description: "Salidas que ya avanzaron de etapa y siguen en revision.",
      emptyMessage: "No hay salidas en proceso con los filtros actuales.",
      accentClassName: "border-sky-200 bg-sky-50 text-sky-800",
      trips: inProgressTrips,
    },
    {
      key: "aceptadas",
      title: "Aceptadas",
      description: "Salidas ya aprobadas administrativamente.",
      emptyMessage: "No hay salidas aceptadas con los filtros actuales.",
      accentClassName: "border-emerald-200 bg-emerald-50 text-emerald-800",
      trips: acceptedTrips,
    },
  ];
}

export default function AdminTripsKanban({ trips }: AdminTripsKanbanProps) {
  const [selectedTrip, setSelectedTrip] = useState<AdminTripRecord | null>(null);
  const columns = useMemo(() => buildKanbanColumns(trips), [trips]);

  function handleTripUpdated(updates: Partial<AdminTripRecord>) {
    setSelectedTrip((currentTrip) => {
      if (!currentTrip) {
        return currentTrip;
      }

      return {
        ...currentTrip,
        ...updates,
      };
    });
  }

  return (
    <>
      <section className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Tablero administrativo</p>
            <h4 className="font-display mt-3 text-2xl font-semibold text-slate-950">Estados de revision tipo kanban</h4>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Haz click en cualquier tarjeta para abrir el detalle completo de la salida y continuar la gestion administrativa desde el modal.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <span className="font-semibold text-slate-950">{trips.length}</span> salida(s) visibles en el tablero
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {columns.map((column) => (
            <article key={column.key} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-950">{column.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{column.description}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${column.accentClassName}`}>
                  {column.trips.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {column.trips.length ? (
                  column.trips.map((trip) => {
                    const { cantidadTotalPasajeros } = getTripPassengerTotals(trip);

                    return (
                      <button
                        key={trip.id}
                        type="button"
                        onClick={() => setSelectedTrip(trip)}
                        className="w-full rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slep hover:bg-white"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-950">{trip.school_name}</p>
                            <p className="text-sm text-slate-500">RBD {trip.rbd}</p>
                          </div>
                          <span className={getAdminDecisionClasses(trip.decision_admin)}>{getAdminDecisionLabel(trip.decision_admin)}</span>
                        </div>

                        <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                          <div>
                            <p className="font-medium text-slate-950">{trip.actividad}</p>
                            <p>{trip.lugar_nombre}</p>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <span>{formatTripDate(trip.fecha)}</span>
                            <span>{cantidadTotalPasajeros} pasajero(s)</span>
                          </div>
                          <div>
                            <span className={getAdminStageClasses(trip.etapa_admin)}>{getAdminStageLabel(trip.etapa_admin)}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-500">
                    {column.emptyMessage}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <DetalleSalida trip={selectedTrip} onClose={() => setSelectedTrip(null)} onTripUpdated={handleTripUpdated} />
    </>
  );
}
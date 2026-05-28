"use client";

import { useState } from "react";

import { formatTripDate, getAdminDecisionClasses, getAdminDecisionLabel, getAdminStageClasses, getAdminStageLabel, getStatusClasses, getStatusLabel, getTripPassengerTotals } from "@/lib/admin/trip-formatting";
import type { AdminTripRecord } from "@/types";

import DetalleSalida from "./DetalleSalida";

interface AdminPendingReviewTableProps {
  trips: AdminTripRecord[];
}

export default function AdminPendingReviewTable({ trips }: AdminPendingReviewTableProps) {
  const [selectedTrip, setSelectedTrip] = useState<AdminTripRecord | null>(null);

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
      <div className="mt-5 space-y-4 xl:hidden">
        {trips.length ? (
          trips.map((trip) => {
            const { cantidadTotalPasajeros } = getTripPassengerTotals(trip);

            return (
              <article key={trip.id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{trip.school_name}</p>
                    <p className="text-sm text-slate-500">RBD {trip.rbd}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTrip(trip)}
                    className="portal-button portal-button--secondary portal-button--sm"
                  >
                    Revisar
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Fecha</p>
                    <p className="mt-1 text-sm text-slate-900">{formatTripDate(trip.fecha)}</p>
                    <p className="text-sm text-slate-500">{trip.hora_salida}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Pasajeros</p>
                    <p className="mt-1 text-sm text-slate-900">{cantidadTotalPasajeros}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Actividad y destino</p>
                    <p className="mt-1 text-sm font-medium text-slate-950">{trip.actividad}</p>
                    <p className="text-sm text-slate-500">{trip.lugar_nombre}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Etapa</p>
                    <div className="mt-1"><span className={getAdminStageClasses(trip.etapa_admin)}>{getAdminStageLabel(trip.etapa_admin)}</span></div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Decision</p>
                    <div className="mt-1"><span className={getAdminDecisionClasses(trip.decision_admin)}>{getAdminDecisionLabel(trip.decision_admin)}</span></div>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Estado</p>
                    <div className="mt-1"><span className={getStatusClasses(trip.estado)}>{getStatusLabel(trip.estado)}</span></div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="portal-table__empty rounded-[24px] border border-slate-200 bg-white">No hay salidas pendientes de revision con los filtros actuales.</div>
        )}
      </div>

      <div className="portal-table mt-5 hidden xl:block">
        <div className="portal-table__head grid min-w-[1190px] grid-cols-[1fr_0.8fr_1fr_0.65fr_0.75fr_0.75fr_0.7fr_0.7fr] gap-4 px-5 py-4">
          <span>Establecimiento</span>
          <span>Fecha</span>
          <span>Actividad / destino</span>
          <span>Pasajeros</span>
          <span>Etapa</span>
          <span>Decision</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>

        {trips.length ? (
          <div className="portal-table__body max-h-[24rem] overflow-y-auto">
            {trips.map((trip) => {
              const { cantidadTotalPasajeros } = getTripPassengerTotals(trip);

              return (
                <div key={trip.id} className="grid min-w-[1190px] grid-cols-[1fr_0.8fr_1fr_0.65fr_0.75fr_0.75fr_0.7fr_0.7fr] gap-4 px-5 py-4 text-sm leading-6 text-slate-700">
                  <div>
                    <p className="font-semibold text-slate-950">{trip.school_name}</p>
                    <p className="text-slate-500">RBD {trip.rbd}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">{formatTripDate(trip.fecha)}</p>
                    <p className="text-slate-500">{trip.hora_salida}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">{trip.actividad}</p>
                    <p className="text-slate-500">{trip.lugar_nombre}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">{cantidadTotalPasajeros}</p>
                  </div>
                  <div>
                    <span className={getAdminStageClasses(trip.etapa_admin)}>{getAdminStageLabel(trip.etapa_admin)}</span>
                  </div>
                  <div>
                    <span className={getAdminDecisionClasses(trip.decision_admin)}>{getAdminDecisionLabel(trip.decision_admin)}</span>
                  </div>
                  <div>
                    <span className={getStatusClasses(trip.estado)}>{getStatusLabel(trip.estado)}</span>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setSelectedTrip(trip)}
                      className="portal-button portal-button--secondary portal-button--sm"
                    >
                      Revisar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="portal-table__empty">No hay salidas pendientes de revision con los filtros actuales.</div>
        )}
      </div>

      <DetalleSalida trip={selectedTrip} onClose={() => setSelectedTrip(null)} onTripUpdated={handleTripUpdated} />
    </>
  );
}
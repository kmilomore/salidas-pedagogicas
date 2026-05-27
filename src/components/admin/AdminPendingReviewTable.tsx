"use client";

import { useState } from "react";

import { formatTripDate, getAdminDecisionClasses, getAdminDecisionLabel, getStatusClasses, getStatusLabel, getTripPassengerTotals } from "@/lib/admin/trip-formatting";
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
      <div className="portal-table mt-5">
        <div className="portal-table__head grid min-w-[1080px] grid-cols-[1fr_0.8fr_1fr_0.65fr_0.75fr_0.7fr_0.7fr] gap-4 px-5 py-4">
          <span>Establecimiento</span>
          <span>Fecha</span>
          <span>Actividad / destino</span>
          <span>Pasajeros</span>
          <span>Decision</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>

        {trips.length ? (
          <div className="portal-table__body max-h-[24rem] overflow-y-auto">
            {trips.map((trip) => {
              const { cantidadTotalPasajeros } = getTripPassengerTotals(trip);

              return (
                <div key={trip.id} className="grid min-w-[1080px] grid-cols-[1fr_0.8fr_1fr_0.65fr_0.75fr_0.7fr_0.7fr] gap-4 px-5 py-4 text-sm leading-6 text-slate-700">
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
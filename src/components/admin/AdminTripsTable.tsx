"use client";

import { useState } from "react";

import { formatDistance, formatTripDate, getStatusClasses, getStatusLabel, getTripPassengerTotals } from "@/lib/admin/trip-formatting";
import type { AdminTripRecord } from "@/types";

import DetalleSalida from "./DetalleSalida";

interface AdminTripsTableProps {
  trips: AdminTripRecord[];
}

export default function AdminTripsTable({ trips }: AdminTripsTableProps) {
  const [selectedTrip, setSelectedTrip] = useState<AdminTripRecord | null>(null);

  function handleTripUpdated(montoReferencial: number | null) {
    setSelectedTrip((currentTrip) => {
      if (!currentTrip) {
        return currentTrip;
      }

      return {
        ...currentTrip,
        monto_referencial: montoReferencial,
      };
    });
  }

  return (
    <>
      <div className="portal-table mt-6">
        <div className="portal-table__head grid min-w-[980px] grid-cols-[1.1fr_0.8fr_1fr_0.7fr_0.8fr_0.7fr_0.7fr] gap-4 px-5 py-4">
          <span>Establecimiento</span>
          <span>Fecha</span>
          <span>Actividad / destino</span>
          <span>Kilometraje</span>
          <span>Total pasajeros</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>

        {trips.length ? (
          <div className="portal-table__body max-h-[32rem] overflow-y-auto">
            {trips.map((trip) => {
              const { cantidadTotalPasajeros } = getTripPassengerTotals(trip);

              return (
                <div key={trip.id} className="grid min-w-[980px] grid-cols-[1.1fr_0.8fr_1fr_0.7fr_0.8fr_0.7fr_0.7fr] gap-4 px-5 py-4 text-sm leading-6 text-slate-700">
                  <div>
                    <p className="font-semibold text-slate-950">{trip.school_name}</p>
                    <p className="text-slate-500">RBD {trip.rbd}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">{formatTripDate(trip.fecha)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">{trip.actividad}</p>
                    <p className="text-slate-500">{trip.lugar_nombre}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">{formatDistance(Number(trip.distancia_km ?? 0))}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">{cantidadTotalPasajeros}</p>
                    <p className="text-slate-500">Incluye funcionarios</p>
                  </div>
                  <div>
                    <span className={getStatusClasses(trip.estado)}>
                      {getStatusLabel(trip.estado)}
                    </span>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setSelectedTrip(trip)}
                      className="portal-button portal-button--secondary portal-button--sm"
                    >
                      Ver detalle
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="portal-table__empty">Aun no existen salidas registradas visibles para administracion.</div>
        )}
      </div>

      <DetalleSalida trip={selectedTrip} onClose={() => setSelectedTrip(null)} onTripUpdated={handleTripUpdated} />
    </>
  );
}
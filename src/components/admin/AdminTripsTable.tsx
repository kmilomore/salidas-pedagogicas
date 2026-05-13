"use client";

import { useState } from "react";

import { formatDistance, formatTripDate, getStatusClasses, getStatusLabel } from "@/lib/admin/trip-formatting";
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
      <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
        <div className="grid grid-cols-[1.1fr_0.8fr_1fr_0.7fr_0.7fr_0.7fr] gap-4 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          <span>Establecimiento</span>
          <span>Fecha</span>
          <span>Actividad / destino</span>
          <span>Kilometraje</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>

        {trips.length ? (
          <div className="divide-y divide-slate-200 bg-white">
            {trips.map((trip) => (
              <div key={trip.id} className="grid grid-cols-[1.1fr_0.8fr_1fr_0.7fr_0.7fr_0.7fr] gap-4 px-5 py-4 text-sm leading-6 text-slate-700">
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
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(trip.estado)}`}>
                    {getStatusLabel(trip.estado)}
                  </span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setSelectedTrip(trip)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slep hover:text-slep"
                  >
                    Ver detalle
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-10 text-sm leading-6 text-slate-600">Aun no existen salidas registradas visibles para administracion.</div>
        )}
      </div>

      <DetalleSalida trip={selectedTrip} onClose={() => setSelectedTrip(null)} onTripUpdated={handleTripUpdated} />
    </>
  );
}
"use client";

import { useState } from "react";

import {
  formatAdminCurrency,
  formatDistance,
  formatTripDate,
  getAdminDecisionClasses,
  getAdminDecisionLabel,
  getAdminStageClasses,
  getAdminStageLabel,
  getAdminTransportLabel,
  getStatusLabel,
  getTripPassengerTotals,
} from "@/lib/admin/trip-formatting";
import type { AdminTripRecord } from "@/types";

import AdminTripNotifyButton from "./AdminTripNotifyButton";
import DetalleSalida from "./DetalleSalida";

interface AdminTripsTableProps {
  trips: AdminTripRecord[];
}

export default function AdminTripsTable({ trips }: AdminTripsTableProps) {
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
      <div className="mt-6 space-y-4 xl:hidden">
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
                    Ver detalle
                  </button>
                </div>

                <div className="mt-3">
                  <AdminTripNotifyButton
                    tripId={trip.id}
                    decision={trip.decision_admin}
                    directorEmail={trip.director_email}
                    alreadyNotified={trip.notificacion_decision_enviada}
                  />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Fecha</p>
                    <p className="mt-1 text-sm text-slate-900">{formatTripDate(trip.fecha)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Kilometraje</p>
                    <p className="mt-1 text-sm text-slate-900">{formatDistance(Number(trip.distancia_km ?? 0))}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Actividad y destino</p>
                    <p className="mt-1 text-sm font-medium text-slate-950">{trip.actividad}</p>
                    <p className="text-sm text-slate-500">{trip.lugar_nombre}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Pasajeros</p>
                    <p className="mt-1 text-sm text-slate-900">{cantidadTotalPasajeros}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Transporte</p>
                    <p className="mt-1 text-sm text-slate-900">{getAdminTransportLabel(trip.tipo_transporte_referencial)}</p>
                    <p className="text-sm text-slate-500">{trip.cantidad_buses_referencial ? `${trip.cantidad_buses_referencial} unidad(es)` : "Cantidad no definida"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Monto</p>
                    <p className="mt-1 text-sm text-slate-900">{formatAdminCurrency(trip.monto_referencial)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Etapa</p>
                    <div className="mt-1"><span className={getAdminStageClasses(trip.etapa_admin)}>{getAdminStageLabel(trip.etapa_admin)}</span></div>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Decision y estado</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className={getAdminDecisionClasses(trip.decision_admin)}>{getAdminDecisionLabel(trip.decision_admin)}</span>
                      <span className="portal-chip portal-chip--info">{getStatusLabel(trip.estado)}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="portal-table__empty rounded-[24px] border border-slate-200 bg-white">Aun no existen salidas registradas visibles para administracion.</div>
        )}
      </div>

      <div className="portal-table mt-6 hidden xl:block">
        <div className="portal-table__head grid min-w-[1290px] grid-cols-[1.1fr_0.8fr_1fr_0.7fr_0.8fr_1fr_0.7fr_0.75fr_0.7fr] gap-4 px-5 py-4">
          <span>Establecimiento</span>
          <span>Fecha</span>
          <span>Actividad / destino</span>
          <span>Kilometraje</span>
          <span>Total pasajeros</span>
          <span>Transporte / monto</span>
          <span>Etapa</span>
          <span>Decision admin</span>
          <span>Acciones</span>
        </div>

        {trips.length ? (
          <div className="portal-table__body max-h-[32rem] overflow-y-auto">
            {trips.map((trip) => {
              const { cantidadTotalPasajeros } = getTripPassengerTotals(trip);

              return (
                <div key={trip.id} className="grid min-w-[1290px] grid-cols-[1.1fr_0.8fr_1fr_0.7fr_0.8fr_1fr_0.7fr_0.75fr_0.7fr] gap-4 px-5 py-4 text-sm leading-6 text-slate-700">
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
                    <p className="font-medium text-slate-950">{getAdminTransportLabel(trip.tipo_transporte_referencial)}</p>
                    <p className="text-slate-500">
                      {trip.cantidad_buses_referencial ? `${trip.cantidad_buses_referencial} unidad(es)` : "Cantidad no definida"}
                    </p>
                    <p className="mt-1 text-slate-500">{formatAdminCurrency(trip.monto_referencial)}</p>
                  </div>
                  <div>
                    <span className={getAdminStageClasses(trip.etapa_admin)}>{getAdminStageLabel(trip.etapa_admin)}</span>
                  </div>
                  <div>
                    <span className={getAdminDecisionClasses(trip.decision_admin)}>
                      {getAdminDecisionLabel(trip.decision_admin)}
                    </span>
                    <p className="mt-2 text-slate-500">{getStatusLabel(trip.estado)}</p>
                  </div>
                  <div>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTrip(trip)}
                        className="portal-button portal-button--secondary portal-button--sm"
                      >
                        Ver detalle
                      </button>
                      <AdminTripNotifyButton
                        tripId={trip.id}
                        decision={trip.decision_admin}
                        directorEmail={trip.director_email}
                        alreadyNotified={trip.notificacion_decision_enviada}
                      />
                    </div>
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
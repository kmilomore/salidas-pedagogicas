"use client";

import { useEffect, useMemo, useState } from "react";

import { formatDistance, formatTripDate, getStatusClasses, getStatusLabel, getTripPassengerTotals } from "@/lib/admin/trip-formatting";
import type { AdminTripRecord } from "@/types";

import DetalleSalida from "./DetalleSalida";

interface SchoolSummary {
  rbd: string;
  schoolName: string;
  tripCount: number;
  passengers: number;
}

interface AdminSchoolTripsExplorerProps {
  trips: AdminTripRecord[];
  topSchools: SchoolSummary[];
}

export default function AdminSchoolTripsExplorer({ trips, topSchools }: AdminSchoolTripsExplorerProps) {
  const [selectedRbd, setSelectedRbd] = useState<string | null>(topSchools[0]?.rbd ?? null);
  const [selectedTrip, setSelectedTrip] = useState<AdminTripRecord | null>(null);

  useEffect(() => {
    if (!topSchools.length) {
      setSelectedRbd(null);
      return;
    }

    if (!selectedRbd || !topSchools.some((school) => school.rbd === selectedRbd)) {
      setSelectedRbd(topSchools[0].rbd);
    }
  }, [selectedRbd, topSchools]);

  const selectedSchool = topSchools.find((school) => school.rbd === selectedRbd) ?? null;
  const selectedSchoolTrips = useMemo(
    () => trips.filter((trip) => trip.rbd === selectedRbd).sort((a, b) => b.fecha.localeCompare(a.fecha) || b.created_at.localeCompare(a.created_at)),
    [selectedRbd, trips],
  );

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
      <section className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">Viajes por escuela</p>
            <p className="mt-1 text-sm text-slate-500">Haz click en un colegio para ver las salidas que tiene asociadas.</p>
          </div>
          {selectedSchool ? (
            <p className="text-sm leading-6 text-slate-500">
              Viendo {selectedSchoolTrips.length} salida(s) de <span className="font-semibold text-slate-700">{selectedSchool.schoolName}</span>.
            </p>
          ) : null}
        </div>

        <div className="portal-table mt-5">
          <div className="portal-table__head grid min-w-[780px] grid-cols-[1.4fr_0.55fr_0.55fr] gap-4 px-5 py-4">
            <span>Establecimiento</span>
            <span>Viajes</span>
            <span>Pasajeros</span>
          </div>

          {topSchools.length ? (
            <div className="portal-table__body max-h-[22rem] overflow-y-auto">
              {topSchools.map((school) => {
                const isSelected = school.rbd === selectedRbd;

                return (
                  <button
                    key={school.rbd}
                    type="button"
                    onClick={() => setSelectedRbd(school.rbd)}
                    className={`grid w-full min-w-[780px] grid-cols-[minmax(0,1.4fr)_minmax(120px,0.55fr)_minmax(120px,0.55fr)] gap-4 px-5 py-4 text-left text-sm leading-6 transition ${
                      isSelected ? "bg-slep/10 text-slate-900" : "text-slate-700 hover:bg-white"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-950">{school.schoolName}</p>
                      <p className="text-slate-500">RBD {school.rbd}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-950">{school.tripCount}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-950">{school.passengers}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="portal-table__empty">Aun no hay viajes visibles para construir el resumen por establecimiento.</div>
          )}
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">Salidas asociadas</p>
              <p className="mt-1 text-sm text-slate-500">Listado de salidas del establecimiento seleccionado dentro de la analitica filtrada.</p>
            </div>
            {selectedSchool ? <p className="text-sm text-slate-500">RBD {selectedSchool.rbd}</p> : null}
          </div>

          {selectedSchool && selectedSchoolTrips.length ? (
            <div className="portal-table mt-5">
              <div className="portal-table__head grid min-w-[980px] grid-cols-[0.8fr_1fr_0.85fr_0.7fr_0.7fr_0.7fr] gap-4 px-5 py-4">
                <span>Fecha</span>
                <span>Actividad / destino</span>
                <span>Comuna / region</span>
                <span>Pasajeros</span>
                <span>Estado</span>
                <span>Acciones</span>
              </div>

              <div className="portal-table__body max-h-[24rem] overflow-y-auto">
                {selectedSchoolTrips.map((trip) => {
                  const { cantidadTotalPasajeros } = getTripPassengerTotals(trip);

                  return (
                    <div key={trip.id} className="grid min-w-[980px] grid-cols-[0.8fr_1fr_0.85fr_0.7fr_0.7fr_0.7fr] gap-4 px-5 py-4 text-sm leading-6 text-slate-700">
                      <div>
                        <p className="font-medium text-slate-950">{formatTripDate(trip.fecha)}</p>
                        <p className="text-slate-500">{trip.hora_salida}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-950">{trip.actividad}</p>
                        <p className="text-slate-500">{trip.lugar_nombre}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-950">{trip.lugar_comuna}</p>
                        <p className="text-slate-500">{trip.lugar_region}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-950">{cantidadTotalPasajeros}</p>
                        <p className="text-slate-500">{formatDistance(Number(trip.distancia_km ?? 0))}</p>
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
                          Ver detalle
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-500">
              {selectedSchool
                ? "El establecimiento seleccionado no tiene salidas visibles con los filtros actuales."
                : "Selecciona un colegio para revisar sus salidas asociadas."}
            </div>
          )}
        </div>
      </section>

      <DetalleSalida trip={selectedTrip} onClose={() => setSelectedTrip(null)} onTripUpdated={handleTripUpdated} />
    </>
  );
}
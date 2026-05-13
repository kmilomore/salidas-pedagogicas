"use client";

import { useMemo } from "react";
import polyline from "@mapbox/polyline";
import { GoogleMap, MarkerF, PolylineF } from "@react-google-maps/api";

import { usePortalGoogleMapsLoader } from "@/lib/google-maps";
import { formatRut } from "@/lib/validations/salida";
import type { AdminTripRecord } from "@/types";

interface DetalleSalidaProps {
  trip: AdminTripRecord | null;
  onClose: () => void;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "No informado";
  }

  return value.slice(0, 5);
}

function formatDistance(value: number) {
  return `${Number(value ?? 0).toFixed(1)} km`;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!hours) {
    return `${remainingMinutes} min`;
  }

  if (!remainingMinutes) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}

export default function DetalleSalida({ trip, onClose }: DetalleSalidaProps) {
  const { isLoaded } = usePortalGoogleMapsLoader();

  const routePath = useMemo(() => {
    if (!trip?.ruta_polyline) {
      return [];
    }

    return polyline.decode(trip.ruta_polyline).map(([lat, lng]) => ({ lat, lng }));
  }, [trip?.ruta_polyline]);

  if (!trip) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Detalle de salida</p>
            <h3 className="font-display mt-3 text-2xl font-semibold text-slate-950 sm:text-3xl">{trip.actividad}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{trip.school_name} · RBD {trip.rbd}</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/api/trips/${trip.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slep hover:text-slep"
            >
              Exportar PDF
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 text-lg font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-950"
              aria-label="Cerrar detalle"
            >
              ×
            </button>
          </div>
        </div>

        <div className="grid max-h-[calc(92vh-88px)] gap-6 overflow-y-auto p-6 sm:p-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)]">
          <div className="space-y-6">
            <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Resumen operacional</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Fecha</p>
                  <p className="mt-2 text-sm font-medium text-slate-950">{trip.fecha}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Horario</p>
                  <p className="mt-2 text-sm font-medium text-slate-950">
                    {formatDateTime(trip.hora_salida)} · {formatDateTime(trip.hora_regreso)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Distancia Total</p>
                  <p className="mt-2 text-sm font-medium text-slate-950">{formatDistance(trip.distancia_km)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Duracion</p>
                  <p className="mt-2 text-sm font-medium text-slate-950">{formatDuration(trip.duracion_minutos)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Ida</p>
                  <p className="mt-2 text-sm font-medium text-slate-950">{formatDistance(trip.distancia_ida_km)} · {formatDuration(trip.duracion_ida_minutos)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Vuelta</p>
                  <p className="mt-2 text-sm font-medium text-slate-950">{formatDistance(trip.distancia_vuelta_km)} · {formatDuration(trip.duracion_vuelta_minutos)}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">PME y justificacion</p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700">
                <div>
                  <p className="font-semibold text-slate-950">Dimension PME</p>
                  <p>{trip.pme_dimension}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-950">Subdimension PME</p>
                  <p>{trip.pme_subdimension}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-950">Objetivo pedagogico</p>
                  <p className="whitespace-pre-line">{trip.objetivo}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Participantes</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Estudiantes</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{trip.cantidad_estudiantes}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Apoderados</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{trip.cantidad_apoderados}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Funcionarios</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{trip.funcionarios.length}</p>
                </div>
                <div className="rounded-2xl border border-slep/20 bg-slep/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slep">Total pasajeros</p>
                  <p className="mt-2 text-2xl font-semibold text-slep">
                    {trip.cantidad_estudiantes + trip.cantidad_apoderados + trip.funcionarios.length}
                  </p>
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-[20px] border border-slate-200">
                <div className="grid grid-cols-[1.1fr_0.8fr_0.9fr] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <span>Funcionario</span>
                  <span>RUT</span>
                  <span>Cargo</span>
                </div>
                {trip.funcionarios.length ? (
                  <div className="divide-y divide-slate-200 bg-white">
                    {trip.funcionarios.map((staff, index) => (
                      <div key={`${staff.rut}-${index}`} className="grid grid-cols-[1.1fr_0.8fr_0.9fr] gap-4 px-4 py-3 text-sm text-slate-700">
                        <span className="font-medium text-slate-950">{staff.nombre_completo}</span>
                        <span>{formatRut(staff.rut)}</span>
                        <span>{staff.cargo}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-5 text-sm text-slate-600">No hay funcionarios registrados para esta salida.</div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[24px] border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Ruta y destino</p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700">
                <div>
                  <p className="font-semibold text-slate-950">Establecimiento de origen</p>
                  <p>{trip.school_name}</p>
                  <p className="text-slate-500">{trip.school_address}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-950">Destino</p>
                  <p>{trip.lugar_nombre}</p>
                  <p className="text-slate-500">{trip.lugar_direccion}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-950">Region y comuna</p>
                  <p>{trip.lugar_comuna} · {trip.lugar_region}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-950">Resumen vial</p>
                  <p>{trip.ruta_resumen}</p>
                </div>
                {trip.director_email ? (
                  <div>
                    <p className="font-semibold text-slate-950">Director asociado</p>
                    <p>{trip.director_email}</p>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Mapa de la salida</p>
              </div>
              <div className="min-h-[360px] bg-slate-50">
                {isLoaded && routePath.length && trip.school_lat !== null && trip.school_lng !== null ? (
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", minHeight: "360px", height: "420px" }}
                    onLoad={(map) => {
                      const bounds = new window.google.maps.LatLngBounds();
                      routePath.forEach((point) => bounds.extend(point));
                      bounds.extend({ lat: trip.school_lat as number, lng: trip.school_lng as number });
                      bounds.extend({ lat: trip.lugar_lat, lng: trip.lugar_lng });
                      map.fitBounds(bounds, 64);
                    }}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false,
                    }}
                  >
                    <MarkerF position={{ lat: trip.school_lat, lng: trip.school_lng }} label={{ text: "E", color: "#ffffff", fontWeight: "700" }} />
                    <MarkerF position={{ lat: trip.lugar_lat, lng: trip.lugar_lng }} label={{ text: "D", color: "#ffffff", fontWeight: "700" }} />
                    <PolylineF
                      path={routePath}
                      options={{
                        strokeColor: "#1B4F8A",
                        strokeOpacity: 0.95,
                        strokeWeight: 6,
                      }}
                    />
                  </GoogleMap>
                ) : (
                  <div className="flex min-h-[360px] items-center justify-center px-6 text-center text-sm leading-6 text-slate-600">
                    No fue posible renderizar el mapa de detalle con los datos actualmente disponibles de esta salida.
                  </div>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Visor previo del PDF</p>
              </div>
              <div className="bg-slate-50 p-4">
                <iframe
                  title={`Vista previa PDF salida ${trip.id}`}
                  src={`/api/trips/${trip.id}/pdf?preview=1`}
                  className="h-[520px] w-full rounded-[20px] border border-slate-200 bg-white"
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
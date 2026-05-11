"use client";

import { useMemo } from "react";
import { GoogleMap, MarkerF, PolylineF } from "@react-google-maps/api";
import polyline from "@mapbox/polyline";

import type { DirectorSchoolProfile, RouteCalculationResult } from "@/types";

import type { SelectedPlace } from "./LugarAutocomplete";

interface MapaRutaProps {
  schoolProfile: DirectorSchoolProfile;
  destination: SelectedPlace;
  route: RouteCalculationResult;
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

export default function MapaRuta({ schoolProfile, destination, route }: MapaRutaProps) {
  const decodedPath = useMemo(
    () => polyline.decode(route.polyline).map(([lat, lng]) => ({ lat, lng })),
    [route.polyline],
  );

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950/5">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-h-[420px]">
          <GoogleMap
            mapContainerStyle={{ width: "100%", minHeight: "420px" }}
            onLoad={(map) => {
              const bounds = new window.google.maps.LatLngBounds();
              bounds.extend({ lat: schoolProfile.latitud, lng: schoolProfile.longitud });
              bounds.extend({ lat: destination.lat, lng: destination.lng });
              decodedPath.forEach((point) => bounds.extend(point));
              map.fitBounds(bounds, 72);
            }}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            <MarkerF position={{ lat: schoolProfile.latitud, lng: schoolProfile.longitud }} title={schoolProfile.nombre} />
            <MarkerF position={{ lat: destination.lat, lng: destination.lng }} title={destination.name} />
            <PolylineF
              path={decodedPath}
              options={{
                strokeColor: "#1B4F8A",
                strokeOpacity: 0.9,
                strokeWeight: 4,
              }}
            />
          </GoogleMap>
        </div>

        <aside className="flex flex-col justify-between gap-6 border-l border-slate-200 bg-white p-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Ruta calculada</p>
            <h4 className="font-display mt-3 text-2xl font-semibold text-slate-950">{destination.name}</h4>
            <p className="mt-3 text-sm leading-6 text-slate-600">{destination.address}</p>
          </div>

          <dl className="grid gap-4 text-sm text-slate-700">
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="font-semibold text-slate-950">Distancia estimada</dt>
              <dd className="mt-1">{route.distancia_km} km desde {schoolProfile.nombre}</dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="font-semibold text-slate-950">Duracion referencial</dt>
              <dd className="mt-1">{formatDuration(route.duracion_minutos)}</dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="font-semibold text-slate-950">Via principal</dt>
              <dd className="mt-1">{route.resumen}</dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="font-semibold text-slate-950">Destino</dt>
              <dd className="mt-1">{destination.comuna}, {destination.region}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
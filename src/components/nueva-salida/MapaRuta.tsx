"use client";

import { useMemo } from "react";
import { GoogleMap, MarkerF, PolylineF } from "@react-google-maps/api";

import type { DirectorSchoolProfile, RouteCalculationResult } from "@/types";

import type { SelectedPlace } from "./LugarAutocomplete";

interface MapaRutaProps {
  schoolProfile: DirectorSchoolProfile;
  destinations: SelectedPlace[];
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

const outboundPalette = [
  "var(--route-blue)",
  "var(--route-teal)",
  "var(--route-cyan)",
  "var(--route-gold)",
  "var(--route-berry)",
  "var(--slep-blue-dark)",
];
const returnColor = "var(--route-return)";

export default function MapaRuta({ schoolProfile, destinations, route }: MapaRutaProps) {
  const isMultiDestination = destinations.length > 1;
  const legendItems = useMemo(
    () =>
      route.segmentos.map((segment, index) => ({
        ...segment,
        color: segment.kind === "return" ? returnColor : outboundPalette[index % outboundPalette.length],
      })),
    [route.segmentos],
  );

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Recorrido en mapa</p>
            <h4 className="font-display mt-2 text-2xl font-semibold text-slate-950">
              {isMultiDestination ? `${destinations.length} tramos operativos mas retorno` : "Ida y vuelta del recorrido"}
            </h4>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Los colores distinguen cada tramo del circuito. Cuando existe un solo destino veras ida y vuelta con colores distintos; cuando hay multiples paradas, cada ruta intermedia y el regreso quedan diferenciados.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {legendItems.map((segment) => (
              <div key={segment.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-8 rounded-full" style={{ backgroundColor: segment.color }} />
                  <p className="font-semibold text-slate-950">{segment.label}</p>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {segment.distanceKm} km · {formatDuration(segment.durationMinutes)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-[420px]">
          <GoogleMap
            mapContainerStyle={{ width: "100%", minHeight: "420px", height: "clamp(420px, 62vh, 720px)" }}
            onLoad={(map) => {
              const bounds = new window.google.maps.LatLngBounds();
              bounds.extend({ lat: schoolProfile.latitud, lng: schoolProfile.longitud });
              destinations.forEach((destination) => bounds.extend({ lat: destination.lat, lng: destination.lng }));
              route.segmentos.forEach((segment) => {
                segment.path.forEach((point) => bounds.extend(point));
              });
              map.fitBounds(bounds, 72);
            }}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              gestureHandling: "greedy",
            }}
          >
            <MarkerF
              position={{ lat: schoolProfile.latitud, lng: schoolProfile.longitud }}
              title={schoolProfile.nombre}
              label={{ text: "E", color: "#ffffff", fontWeight: "700" }}
            />
            {destinations.map((destination, index) => (
              <MarkerF
                key={destination.placeId}
                position={{ lat: destination.lat, lng: destination.lng }}
                title={destination.name}
                label={{ text: String(index + 1), color: "#ffffff", fontWeight: "700" }}
              />
            ))}
            {legendItems.map((segment) => (
              <PolylineF
                key={segment.id}
                path={segment.path}
                options={{
                  strokeColor: segment.color,
                  strokeOpacity: 0.94,
                  strokeWeight: segment.kind === "return" ? 5 : 6,
                  icons:
                    segment.kind === "return"
                      ? [
                          {
                            icon: {
                              path: "M 0,-1 0,1",
                              strokeOpacity: 1,
                              scale: 4,
                            },
                            offset: "0",
                            repeat: "18px",
                          },
                        ]
                      : undefined,
                  zIndex: segment.kind === "return" ? 3 : 4 + segment.order,
                }}
              />
            ))}
          </GoogleMap>
      </div>
    </div>
  );
}
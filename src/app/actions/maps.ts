"use server";

import { z } from "zod";

import type { RouteCalculationInput, RouteCalculationResponse } from "@/types";

const routeStopSchema = z.object({
  placeId: z.string().min(1),
  name: z.string().min(1),
  address: z.string().min(1),
  comuna: z.string().min(1),
  region: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const routeCalculationSchema = z.object({
  origen: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  destinos: z.array(routeStopSchema).min(1).max(10),
});

interface GoogleDirectionsResponse {
  status: string;
  error_message?: string;
  routes?: Array<{
    summary?: string;
    waypoint_order?: number[];
    overview_polyline?: {
      points?: string;
    };
    legs?: Array<{
      distance?: {
        value?: number;
      };
      duration?: {
        value?: number;
      };
      start_address?: string;
      end_address?: string;
    }>;
  }>;
}

export async function calcularRuta(input: RouteCalculationInput): Promise<RouteCalculationResponse> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;

    if (!apiKey) {
      return {
        route: null,
        error: "Falta GOOGLE_MAPS_SERVER_KEY para calcular la ruta.",
      };
    }

    const { origen, destinos } = routeCalculationSchema.parse(input);

    const params = new URLSearchParams({
      origin: `${origen.lat},${origen.lng}`,
      destination: `${origen.lat},${origen.lng}`,
      mode: "driving",
      language: "es",
      region: "cl",
      units: "metric",
      key: apiKey,
    });

    params.set("waypoints", destinos.map((destino) => `place_id:${destino.placeId}`).join("|"));

    const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        route: null,
        error: "Google Directions API no respondio correctamente.",
      };
    }

    const payload = (await response.json()) as GoogleDirectionsResponse;

    if (payload.status !== "OK" || !payload.routes?.length) {
      return {
        route: null,
        error: payload.error_message ?? "No fue posible calcular la ruta seleccionada.",
      };
    }

    const selectedRoute = payload.routes[0];
    const legs = selectedRoute.legs ?? [];
    const polyline = selectedRoute.overview_polyline?.points;

    if (!legs.length || !polyline) {
      return {
        route: null,
        error: "La respuesta de Google Directions no incluyo datos suficientes de ruta.",
      };
    }

    const orderedDestinos =
      selectedRoute.waypoint_order && selectedRoute.waypoint_order.length === destinos.length
        ? selectedRoute.waypoint_order.map((index) => destinos[index])
        : destinos;

    const outboundLegs = legs.slice(0, Math.max(legs.length - 1, 0));
    const returnLeg = legs.at(-1);
    const distanceMeters = legs.reduce((total, leg) => total + (leg.distance?.value ?? 0), 0);
    const durationSeconds = legs.reduce((total, leg) => total + (leg.duration?.value ?? 0), 0);
    const outboundMeters = outboundLegs.reduce((total, leg) => total + (leg.distance?.value ?? 0), 0);
    const outboundDurationSeconds = outboundLegs.reduce((total, leg) => total + (leg.duration?.value ?? 0), 0);
    const returnMeters = returnLeg?.distance?.value ?? 0;
    const returnDurationSeconds = returnLeg?.duration?.value ?? 0;

    if (!distanceMeters || !durationSeconds) {
      return {
        route: null,
        error: "La respuesta de Google Directions no incluyo datos suficientes de ruta.",
      };
    }

    return {
      route: {
        distancia_km: Number((distanceMeters / 1000).toFixed(2)),
        duracion_minutos: Math.max(1, Math.round(durationSeconds / 60)),
        distancia_ida_km: Number((outboundMeters / 1000).toFixed(2)),
        distancia_vuelta_km: Number((returnMeters / 1000).toFixed(2)),
        duracion_ida_minutos: Math.max(1, Math.round(outboundDurationSeconds / 60)),
        duracion_vuelta_minutos: Math.max(1, Math.round(returnDurationSeconds / 60)),
        polyline,
        resumen:
          selectedRoute.summary ||
          `${legs[0]?.start_address ?? "Origen institucional"} hasta ${orderedDestinos.at(-1)?.name ?? "destino"} y regreso`,
        destinos: orderedDestinos,
      },
      error: null,
    };
  } catch (error) {
    return {
      route: null,
      error: error instanceof Error ? error.message : "No fue posible calcular la ruta seleccionada.",
    };
  }
}
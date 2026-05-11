"use server";

import { z } from "zod";

import type { RouteCalculationInput, RouteCalculationResponse } from "@/types";

const routeCalculationSchema = z.object({
  origen: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  destino: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
});

interface GoogleDirectionsResponse {
  status: string;
  error_message?: string;
  routes?: Array<{
    summary?: string;
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

    const { origen, destino } = routeCalculationSchema.parse(input);

    const params = new URLSearchParams({
      origin: `${origen.lat},${origen.lng}`,
      destination: `${destino.lat},${destino.lng}`,
      mode: "driving",
      language: "es",
      region: "cl",
      key: apiKey,
    });

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
    const selectedLeg = selectedRoute.legs?.[0];
    const distanceMeters = selectedLeg?.distance?.value;
    const durationSeconds = selectedLeg?.duration?.value;
    const polyline = selectedRoute.overview_polyline?.points;

    if (!distanceMeters || !durationSeconds || !polyline) {
      return {
        route: null,
        error: "La respuesta de Google Directions no incluyo datos suficientes de ruta.",
      };
    }

    return {
      route: {
        distancia_km: Number((distanceMeters / 1000).toFixed(2)),
        duracion_minutos: Math.max(1, Math.round(durationSeconds / 60)),
        polyline,
        resumen: selectedRoute.summary || `${selectedLeg?.start_address ?? "Origen"} a ${selectedLeg?.end_address ?? "Destino"}`,
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
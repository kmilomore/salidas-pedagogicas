"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { SaveTripResponse, UserRole } from "@/types";

const saveTripSchema = z.object({
  rbd: z.string().min(1),
  fecha: z.string().min(1),
  hora_salida: z.string().min(1),
  hora_regreso: z.string().optional().or(z.literal("")),
  pme_dimension: z.string().min(1),
  pme_subdimension: z.string().min(1),
  objetivo: z.string().min(10),
  actividad: z.string().min(3),
  lugar_nombre: z.string().min(1),
  lugar_direccion: z.string().min(1),
  lugar_lat: z.coerce.number(),
  lugar_lng: z.coerce.number(),
  lugar_place_id: z.string().min(1),
  lugar_comuna: z.string().min(1),
  lugar_region: z.string().min(1),
  distancia_km: z.coerce.number().nonnegative(),
  duracion_minutos: z.coerce.number().int().nonnegative(),
  ruta_polyline: z.string().min(1),
  ruta_resumen: z.string().min(1),
});

export async function guardarSalidaPedagogica(input: z.input<typeof saveTripSchema>): Promise<SaveTripResponse> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        tripId: null,
        error: "No se pudo verificar la sesion antes de guardar la salida.",
      };
    }

    const { data: whitelistUser, error: whitelistError } = await supabase
      .from("whitelist_usuarios")
      .select("rol")
      .eq("email", user.email?.trim().toLowerCase() ?? "")
      .eq("activo", true)
      .maybeSingle<{ rol: UserRole }>();

    if (whitelistError || !whitelistUser) {
      return {
        tripId: null,
        error: "No se pudo validar el rol del usuario antes de guardar la salida.",
      };
    }

    const payload = saveTripSchema.parse(input);

    const { data, error } = await supabase
      .from("salidas_pedagogicas")
      .insert({
        director_id: user.id,
        rbd: payload.rbd,
        fecha: payload.fecha,
        hora_salida: payload.hora_salida,
        hora_regreso: payload.hora_regreso || null,
        pme_dimension: payload.pme_dimension,
        pme_subdimension: payload.pme_subdimension,
        objetivo: payload.objetivo,
        actividad: payload.actividad,
        lugar_nombre: payload.lugar_nombre,
        lugar_direccion: payload.lugar_direccion,
        lugar_lat: payload.lugar_lat,
        lugar_lng: payload.lugar_lng,
        lugar_place_id: payload.lugar_place_id,
        lugar_comuna: payload.lugar_comuna,
        lugar_region: payload.lugar_region,
        distancia_km: payload.distancia_km,
        duracion_minutos: payload.duracion_minutos,
        ruta_polyline: payload.ruta_polyline,
        ruta_resumen: payload.ruta_resumen,
        estado: "borrador",
        cantidad_estudiantes: 0,
        cantidad_apoderados: 0,
        funcionarios: [],
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) {
      return {
        tripId: null,
        error: error?.message ?? "No fue posible guardar la salida pedagogica.",
      };
    }

    return {
      tripId: data.id,
      error: null,
    };
  } catch (error) {
    return {
      tripId: null,
      error: error instanceof Error ? error.message : "No fue posible guardar la salida pedagogica.",
    };
  }
}
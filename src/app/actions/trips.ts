"use server";

import { normalizeMultilineText, normalizeRutForStorage, normalizeSingleLineText } from "@/lib/input-normalization";
import { limitTripCreation } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { salidaSchema, type SalidaSchemaInput } from "@/lib/validations/salida";
import type { SaveTripResponse, UserRole } from "@/types";

export async function guardarSalidaPedagogica(input: SalidaSchemaInput): Promise<SaveTripResponse> {
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
      .select("rol, rbd")
      .eq("email", user.email?.trim().toLowerCase() ?? "")
      .eq("activo", true)
      .maybeSingle<{ rol: UserRole; rbd: string | null }>();

    if (whitelistError || !whitelistUser) {
      return {
        tripId: null,
        error: "No se pudo validar el rol del usuario antes de guardar la salida.",
      };
    }

    const rateLimit = await limitTripCreation(supabase, user.id);

    if (!rateLimit.success) {
      return {
        tripId: null,
        error: "Se alcanzo el limite de formularios por hora para este usuario. Intenta nuevamente mas tarde.",
      };
    }

    const payload = salidaSchema.parse({
      ...input,
      pme_dimension: normalizeSingleLineText(input.pme_dimension),
      pme_subdimension: normalizeSingleLineText(input.pme_subdimension),
      actividad: normalizeSingleLineText(input.actividad),
      objetivo: normalizeMultilineText(input.objetivo),
      lugar_nombre: normalizeSingleLineText(input.lugar_nombre),
      lugar_direccion: normalizeSingleLineText(input.lugar_direccion),
      lugar_comuna: normalizeSingleLineText(input.lugar_comuna),
      lugar_region: normalizeSingleLineText(input.lugar_region),
      ruta_resumen: normalizeSingleLineText(input.ruta_resumen),
      funcionarios: (input.funcionarios ?? []).map((funcionario) => ({
        nombre_completo: normalizeSingleLineText(funcionario.nombre_completo),
        rut: normalizeRutForStorage(funcionario.rut),
        cargo: normalizeSingleLineText(funcionario.cargo),
      })),
    });

    // Para directores el RBD se impone desde la whitelist, no desde el payload.
    // Esto previene que un director registre salidas bajo el RBD de otra escuela
    // aunque conozca el endpoint y manipule el cuerpo de la petición.
    const rbdToSave = whitelistUser.rol === "director" ? whitelistUser.rbd : payload.rbd;

    if (!rbdToSave) {
      return {
        tripId: null,
        error: "No tienes un establecimiento asignado para registrar salidas.",
      };
    }

    const { data, error } = await supabase
      .from("salidas_pedagogicas")
      .insert({
        director_id: user.id,
        rbd: rbdToSave,
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
        distancia_ida_km: payload.distancia_ida_km,
        distancia_vuelta_km: payload.distancia_vuelta_km,
        duracion_minutos: payload.duracion_minutos,
        duracion_ida_minutos: payload.duracion_ida_minutos,
        duracion_vuelta_minutos: payload.duracion_vuelta_minutos,
        ruta_polyline: payload.ruta_polyline,
        ruta_resumen: payload.ruta_resumen,
        ruta_segmentos: payload.ruta_segmentos,
        estado: "enviada",
        cantidad_estudiantes: payload.cantidad_estudiantes,
        cantidad_apoderados: payload.cantidad_apoderados,
        funcionarios: payload.funcionarios,
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
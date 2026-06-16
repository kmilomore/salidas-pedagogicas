"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/admin/audit";
import { normalizeMultilineText, normalizeRutForStorage, normalizeSingleLineText } from "@/lib/input-normalization";
import { limitTripCreation } from "@/lib/rate-limit";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { salidaSchema, type SalidaSchemaInput } from "@/lib/validations/salida";
import type { AdminDecisionStatus, AdminStageStatus, AdminTransportMode, SaveTripResponse, UserRole } from "@/types";

interface UpdateGestionAdministrativaPayload {
  transportMode: AdminTransportMode;
  busCount: string;
  unitAmount: string;
}

interface UpdateObservacionesAdministrativasPayload {
  observations: string;
}

interface SaveAdministrativeReviewPayload {
  transportMode: AdminTransportMode;
  busCount: string;
  unitAmount: string;
  decision: AdminDecisionStatus;
  stage: AdminStageStatus;
  observations: string;
}

interface ParsedAdministrativeTransport {
  error: string | null;
  transportMode: AdminTransportMode | null;
  busCount: number | null;
  unitAmount: number | null;
  totalAmount: number | null;
}

function buildEmptyAdministrativeTransport(): ParsedAdministrativeTransport {
  return {
    error: null,
    transportMode: null,
    busCount: null,
    unitAmount: null,
    totalAmount: null,
  };
}

function parseAdministrativeTransport(payload: UpdateGestionAdministrativaPayload): ParsedAdministrativeTransport {
  if (!payload.transportMode || !["taxi_bus", "bus"].includes(payload.transportMode)) {
    return {
      error: "Selecciona un tipo de transporte valido.",
      transportMode: null,
      busCount: null,
      unitAmount: null,
      totalAmount: null,
    };
  }

  const normalizedBusCount = payload.busCount.trim();
  const normalizedUnitAmount = payload.unitAmount.trim();
  const busCount = Number(normalizedBusCount);
  const unitAmount = Number(normalizedUnitAmount);

  if (!normalizedBusCount || !Number.isInteger(busCount) || busCount <= 0) {
    return {
      error: "Ingresa una cantidad de buses valida mayor a 0.",
      transportMode: null,
      busCount: null,
      unitAmount: null,
      totalAmount: null,
    };
  }

  if (!normalizedUnitAmount || !Number.isFinite(unitAmount) || unitAmount < 0) {
    return {
      error: "Ingresa un valor unitario valido igual o mayor a 0.",
      transportMode: null,
      busCount: null,
      unitAmount: null,
      totalAmount: null,
    };
  }

  const persistedUnitAmount = Number(unitAmount.toFixed(2));
  const persistedTotalAmount = Number((busCount * persistedUnitAmount).toFixed(2));

  return {
    error: null,
    transportMode: payload.transportMode,
    busCount,
    unitAmount: persistedUnitAmount,
    totalAmount: persistedTotalAmount,
  };
}

async function assertAdminForTripAction() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const { data: whitelistUser } = await supabase
    .from("whitelist_usuarios")
    .select("rol")
    .eq("email", user.email.trim().toLowerCase())
    .eq("activo", true)
    .maybeSingle<{ rol: UserRole }>();

  if (!whitelistUser || whitelistUser.rol !== "admin") {
    return null;
  }

  return createAdminClient();
}

export async function updateGestionAdministrativaSalida(
  tripId: string,
  payload: UpdateGestionAdministrativaPayload,
): Promise<{
  error: string | null;
  transportMode: AdminTransportMode | null;
  busCount: number | null;
  unitAmount: number | null;
  totalAmount: number | null;
}> {
  const adminClient = await assertAdminForTripAction();

  if (!adminClient) {
    return {
      error: "No tienes permisos para editar la gestion administrativa.",
      transportMode: null,
      busCount: null,
      unitAmount: null,
      totalAmount: null,
    };
  }

  const parsedTransport = parseAdministrativeTransport(payload);

  if (parsedTransport.error) {
    return parsedTransport;
  }

  const { error } = await adminClient
    .from("salidas_pedagogicas")
    .update({
      tipo_transporte_referencial: parsedTransport.transportMode,
      cantidad_buses_referencial: parsedTransport.busCount,
      valor_unitario_bus_referencial: parsedTransport.unitAmount,
      monto_referencial: parsedTransport.totalAmount,
    })
    .eq("id", tripId);

  if (error) {
    return {
      error: `No fue posible guardar la gestion administrativa. (${error.message})`,
      transportMode: null,
      busCount: null,
      unitAmount: null,
      totalAmount: null,
    };
  }

  revalidatePath("/panel");
  revalidatePath("/panel/analitica");

  await logAuditEvent({
    eventType: "trip_amount_updated",
    route: "/panel",
    targetType: "salida",
    targetId: tripId,
    metadata: {
      transportMode: parsedTransport.transportMode,
      busCount: parsedTransport.busCount,
      unitAmount: parsedTransport.unitAmount,
      amount: parsedTransport.totalAmount,
    },
  });

  return {
    error: null,
    transportMode: parsedTransport.transportMode,
    busCount: parsedTransport.busCount,
    unitAmount: parsedTransport.unitAmount,
    totalAmount: parsedTransport.totalAmount,
  };
}

export async function saveAdministrativeReview(
  tripId: string,
  payload: SaveAdministrativeReviewPayload,
): Promise<{
  error: string | null;
  transportMode: AdminTransportMode | null;
  busCount: number | null;
  unitAmount: number | null;
  totalAmount: number | null;
  decision: AdminDecisionStatus | null;
  stage: AdminStageStatus | null;
  observations: string | null;
}> {
  const adminClient = await assertAdminForTripAction();

  if (!adminClient) {
    return {
      error: "No tienes permisos para guardar la informacion administrativa.",
      transportMode: null,
      busCount: null,
      unitAmount: null,
      totalAmount: null,
      decision: null,
      stage: null,
      observations: null,
    };
  }

  if (!["pendiente", "aceptada", "rechazada"].includes(payload.decision)) {
    return {
      error: "La decision administrativa indicada no es valida.",
      transportMode: null,
      busCount: null,
      unitAmount: null,
      totalAmount: null,
      decision: null,
      stage: null,
      observations: null,
    };
  }

  if (!["pendiente", "etapa_1", "etapa_2", "terminada", "seleccionada"].includes(payload.stage)) {
    return {
      error: "La etapa administrativa indicada no es valida.",
      transportMode: null,
      busCount: null,
      unitAmount: null,
      totalAmount: null,
      decision: null,
      stage: null,
      observations: null,
    };
  }

  const parsedTransport = payload.decision === "rechazada" ? buildEmptyAdministrativeTransport() : parseAdministrativeTransport(payload);

  if (parsedTransport.error) {
    return {
      error: parsedTransport.error,
      transportMode: null,
      busCount: null,
      unitAmount: null,
      totalAmount: null,
      decision: null,
      stage: null,
      observations: null,
    };
  }

  const persistedObservations = normalizeMultilineText(payload.observations ?? "") || null;

  const { error } = await adminClient
    .from("salidas_pedagogicas")
    .update({
      tipo_transporte_referencial: parsedTransport.transportMode,
      cantidad_buses_referencial: parsedTransport.busCount,
      valor_unitario_bus_referencial: parsedTransport.unitAmount,
      monto_referencial: parsedTransport.totalAmount,
      decision_admin: payload.decision,
      etapa_admin: payload.stage,
      observaciones_admin: persistedObservations,
      email_enviado: false,
    })
    .eq("id", tripId);

  if (error) {
    return {
      error: `No fue posible guardar la informacion administrativa. (${error.message})`,
      transportMode: null,
      busCount: null,
      unitAmount: null,
      totalAmount: null,
      decision: null,
      stage: null,
      observations: null,
    };
  }

  revalidatePath("/panel");
  revalidatePath("/panel/analitica");

  await logAuditEvent({
    eventType: "trip_admin_review_updated",
    route: "/panel",
    targetType: "salida",
    targetId: tripId,
    metadata: {
      transportMode: parsedTransport.transportMode,
      busCount: parsedTransport.busCount,
      unitAmount: parsedTransport.unitAmount,
      amount: parsedTransport.totalAmount,
      decision: payload.decision,
      stage: payload.stage,
      hasObservations: Boolean(persistedObservations),
    },
  });

  return {
    error: null,
    transportMode: parsedTransport.transportMode,
    busCount: parsedTransport.busCount,
    unitAmount: parsedTransport.unitAmount,
    totalAmount: parsedTransport.totalAmount,
    decision: payload.decision,
    stage: payload.stage,
    observations: persistedObservations,
  };
}

export async function updateDecisionAdministrativaSalida(
  tripId: string,
  decision: AdminDecisionStatus,
): Promise<{ error: string | null; decision: AdminDecisionStatus | null }> {
  const adminClient = await assertAdminForTripAction();

  if (!adminClient) {
    return {
      error: "No tienes permisos para definir la decision administrativa.",
      decision: null,
    };
  }

  if (!["pendiente", "aceptada", "rechazada"].includes(decision)) {
    return {
      error: "La decision administrativa indicada no es valida.",
      decision: null,
    };
  }

  const { error } = await adminClient
    .from("salidas_pedagogicas")
    .update({ decision_admin: decision, email_enviado: false })
    .eq("id", tripId);

  if (error) {
    return {
      error: `No fue posible guardar la decision administrativa. (${error.message})`,
      decision: null,
    };
  }

  revalidatePath("/panel");
  revalidatePath("/panel/analitica");

  await logAuditEvent({
    eventType: "trip_admin_decision_updated",
    route: "/panel",
    targetType: "salida",
    targetId: tripId,
    metadata: {
      decision,
    },
  });

  return {
    error: null,
    decision,
  };
}

export async function updateEtapaAdministrativaSalida(
  tripId: string,
  stage: AdminStageStatus,
): Promise<{ error: string | null; stage: AdminStageStatus | null }> {
  const adminClient = await assertAdminForTripAction();

  if (!adminClient) {
    return {
      error: "No tienes permisos para definir la etapa administrativa.",
      stage: null,
    };
  }

  if (!["pendiente", "etapa_1", "etapa_2", "terminada", "seleccionada"].includes(stage)) {
    return {
      error: "La etapa administrativa indicada no es valida.",
      stage: null,
    };
  }

  const { error } = await adminClient
    .from("salidas_pedagogicas")
    .update({ etapa_admin: stage })
    .eq("id", tripId);

  if (error) {
    return {
      error: `No fue posible guardar la etapa administrativa. (${error.message})`,
      stage: null,
    };
  }

  revalidatePath("/panel");
  revalidatePath("/panel/analitica");

  await logAuditEvent({
    eventType: "trip_admin_stage_updated",
    route: "/panel",
    targetType: "salida",
    targetId: tripId,
    metadata: {
      stage,
    },
  });

  return {
    error: null,
    stage,
  };
}

export async function updateObservacionesAdministrativasSalida(
  tripId: string,
  payload: UpdateObservacionesAdministrativasPayload,
): Promise<{ error: string | null; observations: string | null }> {
  const adminClient = await assertAdminForTripAction();

  if (!adminClient) {
    return {
      error: "No tienes permisos para editar las observaciones administrativas.",
      observations: null,
    };
  }

  const normalizedObservations = normalizeMultilineText(payload.observations ?? "");
  const persistedObservations = normalizedObservations ? normalizedObservations : null;

  const { error } = await adminClient
    .from("salidas_pedagogicas")
    .update({ observaciones_admin: persistedObservations })
    .eq("id", tripId);

  if (error) {
    return {
      error: `No fue posible guardar las observaciones administrativas. (${error.message})`,
      observations: null,
    };
  }

  revalidatePath("/panel");
  revalidatePath("/panel/analitica");

  await logAuditEvent({
    eventType: "trip_admin_observations_updated",
    route: "/panel",
    targetType: "salida",
    targetId: tripId,
    metadata: {
      hasObservations: Boolean(persistedObservations),
    },
  });

  return {
    error: null,
    observations: persistedObservations,
  };
}

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
      requerimientos_adicionales: normalizeMultilineText(input.requerimientos_adicionales ?? ""),
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
        requerimientos_adicionales: payload.requerimientos_adicionales || null,
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

    await logAuditEvent({
      eventType: "trip_created",
      route: "/nueva-salida",
      targetType: "salida",
      targetId: data.id,
      targetLabel: payload.lugar_nombre,
      metadata: {
        rbd: rbdToSave,
        role: whitelistUser.rol,
        fecha: payload.fecha,
        totalPassengers: payload.cantidad_estudiantes + payload.cantidad_apoderados + payload.funcionarios.length,
      },
    });

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
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import type { JSXElementConstructor, ReactElement } from "react";

import TripSummaryPdf from "@/components/pdf/TripSummaryPdf";
import { logAuditEvent } from "@/lib/admin/audit";
import { getAuthorizedTripById } from "@/lib/admin/trips";
import { createAdminClient } from "@/lib/supabase/server";
import { loadTripPdfAssets } from "@/lib/trips/pdf-assets";

export const runtime = "nodejs";
export const maxDuration = 60;

type NotifyDecision = "aceptada" | "rechazada";
type NotifyKind = "submission" | "admin_decision";

function normalizeNotifyKind(value: string | null | undefined): NotifyKind | null {
  if (value === "admin_decision") {
    return "admin_decision";
  }

  if (value === "submission") {
    return "submission";
  }

  return null;
}

interface RouteContext {
  params: { id: string };
}

export async function POST(_request: Request, { params }: RouteContext) {
  let requestBody: { notificationKind?: NotifyKind } | null = null;
  try {
    requestBody = await _request.json();
  } catch {
    requestBody = null;
  }

  const requestUrl = new URL(_request.url);
  const kindFromQuery = normalizeNotifyKind(requestUrl.searchParams.get("notificationKind"));
  const kindFromHeader = normalizeNotifyKind(_request.headers.get("x-notification-kind"));
  const kindFromBody = normalizeNotifyKind(requestBody?.notificationKind);
  const notificationKind = kindFromQuery ?? kindFromHeader ?? kindFromBody ?? "submission";

  const webhookUrl = process.env.APPS_SCRIPT_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    console.error("[notify] APPS_SCRIPT_WEBHOOK_URL no configurada");
    await logAuditEvent({
      eventType: "trip_notify_skipped",
      severity: "warning",
      route: "/api/trips/[id]/notify",
      targetType: "salida",
      targetId: params.id,
      metadata: {
        reason: "missing_webhook_url",
        notificationKind,
      },
    });
    return new Response("Webhook no configurado", { status: 503 });
  }

  const trip = await getAuthorizedTripById(params.id);
  if (!trip) {
    console.error("[notify] Salida no encontrada o no autorizada:", params.id);
    await logAuditEvent({
      eventType: "trip_notify_rejected",
      severity: "warning",
      route: "/api/trips/[id]/notify",
      targetType: "salida",
      targetId: params.id,
      metadata: {
        reason: "trip_not_found_or_unauthorized",
        notificationKind,
      },
    });
    return new Response("Salida no encontrada", { status: 404 });
  }

  if (!trip.director_email) {
    console.error("[notify] Sin correo de director para RBD:", trip.rbd, "tripId:", trip.id);
    await logAuditEvent({
      eventType: "trip_notify_skipped",
      severity: "warning",
      route: "/api/trips/[id]/notify",
      targetType: "salida",
      targetId: trip.id,
      targetLabel: trip.school_name,
      metadata: {
        reason: "missing_director_email",
        rbd: trip.rbd,
        notificationKind,
      },
    });
    return new Response("Sin correo de director asociado", { status: 422 });
  }

  let decisionForNotification: NotifyDecision | null = null;
  if (notificationKind === "admin_decision") {
    if (trip.decision_admin !== "aceptada" && trip.decision_admin !== "rechazada") {
      await logAuditEvent({
        eventType: "trip_notify_skipped",
        severity: "warning",
        route: "/api/trips/[id]/notify",
        targetType: "salida",
        targetId: trip.id,
        targetLabel: trip.school_name,
        metadata: {
          reason: "decision_not_notifiable",
          decision_admin: trip.decision_admin,
          notificationKind,
        },
      });
      return new Response("Solo se puede notificar cuando la salida esta aceptada o rechazada", { status: 422 });
    }

    decisionForNotification = trip.decision_admin;
  }

  console.log("[notify] Generando PDF para tripId:", trip.id, "rbd:", trip.rbd);

  const pdfAssets = await loadTripPdfAssets(trip);
  const document = createElement(TripSummaryPdf, { trip, ...pdfAssets }) as unknown as ReactElement<
    DocumentProps,
    string | JSXElementConstructor<object>
  >;
  const buffer = await renderToBuffer(document);
  const pdfBase64 = Buffer.from(buffer).toString("base64");

  console.log("[notify] PDF generado, tamaño base64:", pdfBase64.length, "chars");

  const payload = {
    secret:              process.env.APPS_SCRIPT_WEBHOOK_SECRET ?? "",
    notificationKind,
    decisionAdmin:       decisionForNotification,
    supportEmail:        "cesar.mayo@slepcolchagua.cl",
    directorEmail:       trip.director_email,
    schoolName:          trip.school_name,
    rbd:                 trip.rbd,
    fecha:               trip.fecha,
    actividad:           trip.actividad,
    destino:             trip.lugar_nombre,
    distanciaKm:         trip.distancia_km,
    cantidadEstudiantes: trip.cantidad_estudiantes,
    cantidadApoderados:  trip.cantidad_apoderados,
    observacionesAdmin:  trip.observaciones_admin,
    observacionesDirector: trip.requerimientos_adicionales,
    tripId:              trip.id,
    pdfBase64,
  };

  console.log("[notify] Enviando a Apps Script, directorEmail:", trip.director_email);

  const gsResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!gsResponse.ok) {
    const text = await gsResponse.text().catch(() => "");
    console.error("[notify] Apps Script error:", gsResponse.status, text);
    await logAuditEvent({
      eventType: "trip_notify_failed",
      severity: "error",
      route: "/api/trips/[id]/notify",
      targetType: "salida",
      targetId: trip.id,
      targetLabel: trip.school_name,
      metadata: {
        status: gsResponse.status,
        rbd: trip.rbd,
        notificationKind,
        decision_admin: decisionForNotification,
      },
    });
    return new Response("Error al llamar al webhook", { status: 502 });
  }

  const responseText = await gsResponse.text().catch(() => "");
  console.log("[notify] Apps Script respondió OK:", responseText);

  try {
    const adminClient = createAdminClient();
    const updateResult = await adminClient
      .from("salidas_pedagogicas")
      .update({
        email_enviado: true,
        notificacion_decision_enviada: notificationKind === "admin_decision" ? true : null,
        notificacion_decision_enviada_at: notificationKind === "admin_decision" ? new Date().toISOString() : null,
      })
      .eq("id", trip.id);

    if (updateResult.error) {
      await adminClient.from("salidas_pedagogicas").update({ email_enviado: true }).eq("id", trip.id);
    }
  } catch (updateError) {
    console.warn("[notify] No se pudo actualizar marca de notificacion:", updateError);
  }

  await logAuditEvent({
    eventType: "trip_notify_sent",
    route: "/api/trips/[id]/notify",
    targetType: "salida",
    targetId: trip.id,
    targetLabel: trip.school_name,
    metadata: {
      rbd: trip.rbd,
      directorEmail: trip.director_email,
      notificationKind,
      decision_admin: decisionForNotification,
    },
  });

  return new Response(null, { status: 204 });
}

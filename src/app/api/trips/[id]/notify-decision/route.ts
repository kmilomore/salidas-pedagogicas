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

function normalizeNotifyDecision(value: string | null | undefined): NotifyDecision | null {
  if (value === "aceptada" || value === "rechazada") {
    return value;
  }

  return null;
}

interface RouteContext {
  params: { id: string };
}

export async function POST(request: Request, { params }: RouteContext) {
  const webhookUrl = process.env.APPS_SCRIPT_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    await logAuditEvent({
      eventType: "trip_notify_skipped",
      severity: "warning",
      route: "/api/trips/[id]/notify-decision",
      targetType: "salida",
      targetId: params.id,
      metadata: { reason: "missing_webhook_url", notificationKind: "admin_decision" },
    });
    return new Response("Webhook no configurado", { status: 503 });
  }

  let requestBody: { decisionAdmin?: NotifyDecision } | null = null;
  try {
    requestBody = await request.json();
  } catch {
    requestBody = null;
  }

  const url = new URL(request.url);
  const decisionFromQuery = normalizeNotifyDecision(url.searchParams.get("decisionAdmin"));
  const decisionFromHeader = normalizeNotifyDecision(request.headers.get("x-decision-admin"));
  const decisionFromBody = normalizeNotifyDecision(requestBody?.decisionAdmin);
  const requestedDecision = decisionFromQuery ?? decisionFromHeader ?? decisionFromBody;

  if (!requestedDecision) {
    return new Response("decisionAdmin requerido: aceptada o rechazada", { status: 422 });
  }

  const trip = await getAuthorizedTripById(params.id);
  if (!trip) {
    return new Response("Salida no encontrada", { status: 404 });
  }

  if (!trip.director_email) {
    await logAuditEvent({
      eventType: "trip_notify_skipped",
      severity: "warning",
      route: "/api/trips/[id]/notify-decision",
      targetType: "salida",
      targetId: trip.id,
      targetLabel: trip.school_name,
      metadata: {
        reason: "missing_director_email",
        rbd: trip.rbd,
        notificationKind: "admin_decision",
      },
    });
    return new Response("Sin correo de director asociado", { status: 422 });
  }

  if (trip.decision_admin !== "aceptada" && trip.decision_admin !== "rechazada") {
    return new Response("Solo se puede notificar cuando la salida esta aceptada o rechazada", { status: 422 });
  }

  if (requestedDecision !== trip.decision_admin) {
    return new Response("La decision administrativa cambio. Guarda y vuelve a intentar.", { status: 409 });
  }

  const pdfAssets = await loadTripPdfAssets(trip);
  const document = createElement(TripSummaryPdf, { trip, ...pdfAssets }) as unknown as ReactElement<
    DocumentProps,
    string | JSXElementConstructor<object>
  >;
  const buffer = await renderToBuffer(document);
  const pdfBase64 = Buffer.from(buffer).toString("base64");

  const payload = {
    secret: process.env.APPS_SCRIPT_WEBHOOK_SECRET ?? "",
    notificationKind: "admin_decision",
    decisionAdmin: trip.decision_admin,
    supportEmail: "cesar.mayo@slepcolchagua.cl",
    directorEmail: trip.director_email,
    schoolName: trip.school_name,
    rbd: trip.rbd,
    fecha: trip.fecha,
    actividad: trip.actividad,
    destino: trip.lugar_nombre,
    distanciaKm: trip.distancia_km,
    cantidadEstudiantes: trip.cantidad_estudiantes,
    cantidadApoderados: trip.cantidad_apoderados,
    observacionesAdmin: trip.observaciones_admin,
    observacionesDirector: trip.requerimientos_adicionales,
    tripId: trip.id,
    pdfBase64,
  };

  const gsResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!gsResponse.ok) {
    const text = await gsResponse.text().catch(() => "");
    await logAuditEvent({
      eventType: "trip_notify_failed",
      severity: "error",
      route: "/api/trips/[id]/notify-decision",
      targetType: "salida",
      targetId: trip.id,
      targetLabel: trip.school_name,
      metadata: {
        status: gsResponse.status,
        message: text,
        rbd: trip.rbd,
        notificationKind: "admin_decision",
        decision_admin: trip.decision_admin,
      },
    });
    const normalizedText = text.trim();
    return new Response(
      normalizedText
        ? `Error webhook (${gsResponse.status}): ${normalizedText.slice(0, 500)}`
        : `Error webhook (${gsResponse.status}) sin detalle`,
      { status: 502 },
    );
  }

  const webhookText = await gsResponse.text().catch(() => "");
  let webhookJson: { ok?: boolean; sentType?: string; error?: string } | null = null;
  try {
    webhookJson = webhookText ? (JSON.parse(webhookText) as { ok?: boolean; sentType?: string; error?: string }) : null;
  } catch {
    webhookJson = null;
  }

  const sentType = webhookJson?.sentType;
  const webhookOk = webhookJson?.ok;
  if (webhookOk !== true || sentType !== "admin_decision") {
    await logAuditEvent({
      eventType: "trip_notify_failed",
      severity: "error",
      route: "/api/trips/[id]/notify-decision",
      targetType: "salida",
      targetId: trip.id,
      targetLabel: trip.school_name,
      metadata: {
        reason: "unexpected_webhook_response_type",
        webhookOk,
        sentType: sentType ?? null,
        responsePreview: webhookText.slice(0, 500),
      },
    });

    const reason = webhookText ? webhookText.slice(0, 500) : "sin detalle de respuesta";
    return new Response(`Webhook no confirmo notificacion de decision: ${reason}`, { status: 502 });
  }

  try {
    const adminClient = createAdminClient();
    const updateResult = await adminClient
      .from("salidas_pedagogicas")
      .update({
        email_enviado: true,
        notificacion_decision_enviada: true,
        notificacion_decision_enviada_at: new Date().toISOString(),
      })
      .eq("id", trip.id);

    if (updateResult.error) {
      await adminClient.from("salidas_pedagogicas").update({ email_enviado: true }).eq("id", trip.id);
    }
  } catch {
    // No bloquear respuesta por falla de marcado interno.
  }

  await logAuditEvent({
    eventType: "trip_notify_sent",
    route: "/api/trips/[id]/notify-decision",
    targetType: "salida",
    targetId: trip.id,
    targetLabel: trip.school_name,
    metadata: {
      rbd: trip.rbd,
      directorEmail: trip.director_email,
      notificationKind: "admin_decision",
      decision_admin: trip.decision_admin,
    },
  });

  return new Response(null, { status: 204 });
}

import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import type { JSXElementConstructor, ReactElement } from "react";

import TripSummaryPdf from "@/components/pdf/TripSummaryPdf";
import { getAuthorizedTripById } from "@/lib/admin/trips";
import { loadTripPdfAssets } from "@/lib/trips/pdf-assets";

export const runtime = "nodejs";
export const maxDuration = 60;

interface RouteContext {
  params: { id: string };
}

export async function POST(_request: Request, { params }: RouteContext) {
  const webhookUrl = process.env.APPS_SCRIPT_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    console.error("[notify] APPS_SCRIPT_WEBHOOK_URL no configurada");
    return new Response("Webhook no configurado", { status: 503 });
  }

  const trip = await getAuthorizedTripById(params.id);
  if (!trip) {
    console.error("[notify] Salida no encontrada o no autorizada:", params.id);
    return new Response("Salida no encontrada", { status: 404 });
  }

  if (!trip.director_email) {
    console.error("[notify] Sin correo de director para RBD:", trip.rbd, "tripId:", trip.id);
    return new Response("Sin correo de director asociado", { status: 422 });
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
    directorEmail:       trip.director_email,
    schoolName:          trip.school_name,
    rbd:                 trip.rbd,
    fecha:               trip.fecha,
    actividad:           trip.actividad,
    destino:             trip.lugar_nombre,
    distanciaKm:         trip.distancia_km,
    cantidadEstudiantes: trip.cantidad_estudiantes,
    cantidadApoderados:  trip.cantidad_apoderados,
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
    return new Response("Error al llamar al webhook", { status: 502 });
  }

  const responseText = await gsResponse.text().catch(() => "");
  console.log("[notify] Apps Script respondió OK:", responseText);

  return new Response(null, { status: 204 });
}

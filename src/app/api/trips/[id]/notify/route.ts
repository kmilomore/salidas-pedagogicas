import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import type { JSXElementConstructor, ReactElement } from "react";

import TripSummaryPdf from "@/components/pdf/TripSummaryPdf";
import { getAuthorizedTripById } from "@/lib/admin/trips";
import { loadTripPdfAssets } from "@/lib/trips/pdf-assets";

export const runtime = "nodejs";

interface RouteContext {
  params: { id: string };
}

export async function POST(_request: Request, { params }: RouteContext) {
  const webhookUrl = process.env.APPS_SCRIPT_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return new Response("Webhook no configurado", { status: 503 });
  }

  const trip = await getAuthorizedTripById(params.id);
  if (!trip) {
    return new Response("Salida no encontrada", { status: 404 });
  }

  if (!trip.director_email) {
    return new Response("Sin correo de director asociado", { status: 422 });
  }

  const pdfAssets = await loadTripPdfAssets(trip);
  const document = createElement(TripSummaryPdf, { trip, ...pdfAssets }) as unknown as ReactElement<
    DocumentProps,
    string | JSXElementConstructor<object>
  >;
  const buffer = await renderToBuffer(document);
  const pdfBase64 = Buffer.from(buffer).toString("base64");

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

  return new Response(null, { status: 204 });
}

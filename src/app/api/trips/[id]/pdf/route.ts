import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import type { JSXElementConstructor, ReactElement } from "react";

import TripSummaryPdf from "@/components/pdf/TripSummaryPdf";
import { logAuditEvent } from "@/lib/admin/audit";
import { getAuthorizedTripById } from "@/lib/admin/trips";
import { loadTripPdfAssets } from "@/lib/trips/pdf-assets";

export const runtime = "nodejs";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const trip = await getAuthorizedTripById(params.id);

  if (!trip) {
    return new Response("Salida no encontrada", { status: 404 });
  }

  const pdfAssets = await loadTripPdfAssets(trip);
  const document = createElement(TripSummaryPdf, { trip, ...pdfAssets }) as unknown as ReactElement<DocumentProps, string | JSXElementConstructor<object>>;
  const buffer = await renderToBuffer(document);
  const body = new Uint8Array(buffer);
  const { searchParams } = new URL(request.url);
  const disposition = searchParams.get("preview") === "1" ? "inline" : "attachment";

  await logAuditEvent({
    eventType: disposition === "inline" ? "trip_pdf_previewed" : "trip_pdf_downloaded",
    route: "/api/trips/[id]/pdf",
    targetType: "salida",
    targetId: trip.id,
    targetLabel: `${trip.school_name} · ${trip.fecha}`,
    metadata: {
      disposition,
      rbd: trip.rbd,
    },
  });

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="salida-${trip.rbd}-${trip.fecha}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
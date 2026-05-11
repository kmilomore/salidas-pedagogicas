import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import type { JSXElementConstructor, ReactElement } from "react";

import TripSummaryPdf from "@/components/pdf/TripSummaryPdf";
import { getAuthorizedTripById } from "@/lib/admin/trips";

export const runtime = "nodejs";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const trip = await getAuthorizedTripById(params.id);

  if (!trip) {
    return new Response("Salida no encontrada", { status: 404 });
  }

  const document = createElement(TripSummaryPdf, { trip }) as unknown as ReactElement<DocumentProps, string | JSXElementConstructor<object>>;
  const buffer = await renderToBuffer(document);
  const body = new Uint8Array(buffer);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="salida-${trip.rbd}-${trip.fecha}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
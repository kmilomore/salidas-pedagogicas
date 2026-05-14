import { logAuditEvent } from "@/lib/admin/audit";
import { buildTripsCsv, filterTrips, getAdminTrips } from "@/lib/admin/trips";
import type { TripQueryFilters } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawEstado = searchParams.get("estado");
  const filters: TripQueryFilters = {
    search: searchParams.get("search") ?? undefined,
    rbd: searchParams.get("rbd") ?? undefined,
    estado: rawEstado === "borrador" || rawEstado === "enviada" ? rawEstado : "all",
  };

  const trips = filterTrips(await getAdminTrips(), filters);
  const csv = buildTripsCsv(trips);
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  await logAuditEvent({
    eventType: "export_csv",
    route: "/api/admin/export-csv",
    targetType: "export",
    targetLabel: "CSV de salidas",
    metadata: {
      count: trips.length,
      filters,
    },
  });

  return new Response(`\uFEFF${csv}`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="salidas-pedagogicas-${timestamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
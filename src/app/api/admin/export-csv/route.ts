import { buildTripsCsv, filterTrips, getAdminTrips } from "@/lib/admin/trips";
import type { TripQueryFilters } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters: TripQueryFilters = {
    search: searchParams.get("search") ?? undefined,
    rbd: searchParams.get("rbd") ?? undefined,
    estado: (searchParams.get("estado") as TripQueryFilters["estado"]) ?? "all",
  };

  const trips = filterTrips(await getAdminTrips(), filters);
  const csv = buildTripsCsv(trips);
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  return new Response(`\uFEFF${csv}`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="salidas-pedagogicas-${timestamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
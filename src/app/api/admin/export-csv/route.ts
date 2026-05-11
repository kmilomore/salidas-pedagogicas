import { buildTripsCsv, getAdminTrips } from "@/lib/admin/trips";

export async function GET() {
  const trips = await getAdminTrips();
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
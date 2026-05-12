import * as XLSX from "xlsx";

import { filterTrips, getAdminTrips } from "@/lib/admin/trips";
import type { TripQueryFilters } from "@/types";

const sanitizeFormula = (value: string | null | undefined) => {
  const text = String(value ?? "");
  return /^[=+\-@|]/.test(text) ? `'${text}` : text;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawEstado = searchParams.get("estado");
  const filters: TripQueryFilters = {
    search: searchParams.get("search") ?? undefined,
    rbd: searchParams.get("rbd") ?? undefined,
    estado: rawEstado === "borrador" || rawEstado === "enviada" ? rawEstado : "all",
  };

  const trips = filterTrips(await getAdminTrips(), filters);
  const workbook = XLSX.utils.book_new();

  const tripRows = trips.map((trip) => ({
    ID: trip.id,
    Fecha: trip.fecha,
    HoraSalida: trip.hora_salida,
    HoraRegreso: trip.hora_regreso ?? "",
    Estado: trip.estado,
    RBD: trip.rbd,
    Establecimiento: sanitizeFormula(trip.school_name),
    ComunaEstablecimiento: sanitizeFormula(trip.school_comuna),
    Director: trip.director_email ?? "",
    PmeDimension: sanitizeFormula(trip.pme_dimension),
    PmeSubdimension: sanitizeFormula(trip.pme_subdimension),
    Actividad: sanitizeFormula(trip.actividad),
    Objetivo: sanitizeFormula(trip.objetivo),
    Destino: sanitizeFormula(trip.lugar_nombre),
    DireccionDestino: sanitizeFormula(trip.lugar_direccion),
    ComunaDestino: sanitizeFormula(trip.lugar_comuna),
    RegionDestino: sanitizeFormula(trip.lugar_region),
    DistanciaKm: trip.distancia_km,
    DistanciaIdaKm: trip.distancia_ida_km,
    DistanciaVueltaKm: trip.distancia_vuelta_km,
    DuracionMinutos: trip.duracion_minutos,
    DuracionIdaMinutos: trip.duracion_ida_minutos,
    DuracionVueltaMinutos: trip.duracion_vuelta_minutos,
    Estudiantes: trip.cantidad_estudiantes,
    Apoderados: trip.cantidad_apoderados,
    ResumenRuta: sanitizeFormula(trip.ruta_resumen),
    CreadoEn: trip.created_at,
  }));

  const staffRows = trips.flatMap((trip) =>
    trip.funcionarios.map((staff) => ({
      SalidaID: trip.id,
      Fecha: trip.fecha,
      Establecimiento: sanitizeFormula(trip.school_name),
      RBD: trip.rbd,
      Actividad: sanitizeFormula(trip.actividad),
      Destino: sanitizeFormula(trip.lugar_nombre),
      Funcionario: sanitizeFormula(staff.nombre_completo),
      Rut: staff.rut,
      Cargo: sanitizeFormula(staff.cargo),
    })),
  );

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(tripRows), "Salidas");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(staffRows), "Funcionarios");

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="salidas-pedagogicas-${timestamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
import * as XLSX from "xlsx";

import { filterTrips, getAdminTrips } from "@/lib/admin/trips";
import type { TripQueryFilters } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters: TripQueryFilters = {
    search: searchParams.get("search") ?? undefined,
    rbd: searchParams.get("rbd") ?? undefined,
    estado: (searchParams.get("estado") as TripQueryFilters["estado"]) ?? "all",
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
    Establecimiento: trip.school_name,
    ComunaEstablecimiento: trip.school_comuna,
    Director: trip.director_email ?? "",
    PmeDimension: trip.pme_dimension,
    PmeSubdimension: trip.pme_subdimension,
    Actividad: trip.actividad,
    Objetivo: trip.objetivo,
    Destino: trip.lugar_nombre,
    DireccionDestino: trip.lugar_direccion,
    ComunaDestino: trip.lugar_comuna,
    RegionDestino: trip.lugar_region,
    DistanciaKm: trip.distancia_km,
    DuracionMinutos: trip.duracion_minutos,
    Estudiantes: trip.cantidad_estudiantes,
    Apoderados: trip.cantidad_apoderados,
    ResumenRuta: trip.ruta_resumen,
    CreadoEn: trip.created_at,
  }));

  const staffRows = trips.flatMap((trip) =>
    trip.funcionarios.map((staff) => ({
      SalidaID: trip.id,
      Fecha: trip.fecha,
      Establecimiento: trip.school_name,
      RBD: trip.rbd,
      Actividad: trip.actividad,
      Destino: trip.lugar_nombre,
      Funcionario: staff.nombre_completo,
      Rut: staff.rut,
      Cargo: staff.cargo,
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
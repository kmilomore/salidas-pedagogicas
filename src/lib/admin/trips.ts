import { redirect } from "next/navigation";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { AdminTripRecord, RouteSegment, SchoolRecord, TripQueryFilters, TripStaffMember, UserRole } from "@/types";

interface AdminTripQueryRow {
  id: string;
  rbd: string;
  fecha: string;
  hora_salida: string;
  hora_regreso: string | null;
  pme_dimension: string;
  pme_subdimension: string;
  objetivo: string;
  actividad: string;
  lugar_nombre: string;
  lugar_direccion: string;
  lugar_lat: number;
  lugar_lng: number;
  lugar_comuna: string;
  lugar_region: string;
  distancia_km: number;
  distancia_ida_km: number | null;
  distancia_vuelta_km: number | null;
  duracion_minutos: number;
  duracion_ida_minutos: number | null;
  duracion_vuelta_minutos: number | null;
  ruta_polyline: string;
  ruta_resumen: string;
  ruta_segmentos: RouteSegment[] | null;
  monto_referencial?: number | null;
  estado: "borrador" | "enviada";
  cantidad_estudiantes: number;
  cantidad_apoderados: number;
  funcionarios: TripStaffMember[] | null;
  created_at: string;
}

interface SchoolLookupRow extends Pick<SchoolRecord, "RBD" | "COMUNA" | "LATITUD" | "LONGITUD" | "DIRECCIÓN"> {
  "NOMBRE ESTABLECIMIENTO": string | null;
}

interface DirectorLookupRow {
  email: string;
  rbd: string | null;
}

interface AuthContext {
  supabase: ReturnType<typeof createClient>;
  userId: string;
  role: UserRole;
}

function parseCoordinate(value: string | null) {
  if (!value) {
    return null;
  }

  const sanitized = value.trim().replace(/\s/g, "");

  if (!sanitized) {
    return null;
  }

  let normalizedText = sanitized;

  if (sanitized.includes(",") && !sanitized.includes(".")) {
    const segments = sanitized.split(",").filter(Boolean);
    normalizedText = segments.length >= 2 ? `${segments[0]}.${segments.slice(1).join("")}` : sanitized.replace(",", ".");
  } else if (sanitized.includes(",") && sanitized.includes(".")) {
    normalizedText = sanitized.replace(/,/g, "");
  }

  const normalized = Number(normalizedText);
  return Number.isFinite(normalized) ? normalized : null;
}

async function assertRoleAccess(allowedRoles: UserRole[]): Promise<AuthContext> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const { data: whitelistUser, error: whitelistError } = await supabase
    .from("whitelist_usuarios")
    .select("rol")
    .eq("email", user.email.trim().toLowerCase())
    .eq("activo", true)
    .maybeSingle<{ rol: UserRole }>();

  if (whitelistError || !whitelistUser || !allowedRoles.includes(whitelistUser.rol)) {
    redirect("/acceso-denegado");
  }

  return {
    supabase,
    userId: user.id,
    role: whitelistUser.rol,
  };
}

export async function assertAdminAccess() {
  const context = await assertRoleAccess(["admin"]);
  return context.supabase;
}

async function enrichTrips(trips: AdminTripQueryRow[]) {
  if (!trips.length) {
    return [] as AdminTripRecord[];
  }

  const rbds = Array.from(new Set(trips.map((trip) => trip.rbd)));
  const adminSupabase = createAdminClient();
  const [{ data: schools }, { data: directors }] = await Promise.all([
    adminSupabase
      .from("BASE DE DATOS ESCUELAS SLEP")
      .select('RBD,"NOMBRE ESTABLECIMIENTO",COMUNA,LATITUD,LONGITUD,"DIRECCIÓN"')
      .in("RBD", rbds)
      .returns<SchoolLookupRow[]>(),
    adminSupabase
      .from("whitelist_usuarios")
      .select("email, rbd")
      .eq("rol", "director")
      .eq("activo", true)
      .in("rbd", rbds)
      .returns<DirectorLookupRow[]>(),
  ]);

  const schoolMap = new Map((schools ?? []).filter((school) => school.RBD).map((school) => [school.RBD as string, school]));
  const directorMap = new Map((directors ?? []).filter((director) => director.rbd).map((director) => [director.rbd as string, director.email]));

  return trips.map((trip) => {
    const school = schoolMap.get(trip.rbd);

    return {
      ...trip,
      distancia_ida_km: Number(trip.distancia_ida_km ?? 0),
      distancia_vuelta_km: Number(trip.distancia_vuelta_km ?? 0),
      duracion_ida_minutos: Number(trip.duracion_ida_minutos ?? 0),
      duracion_vuelta_minutos: Number(trip.duracion_vuelta_minutos ?? 0),
      monto_referencial: trip.monto_referencial === null || trip.monto_referencial === undefined ? null : Number(trip.monto_referencial),
      ruta_segmentos: Array.isArray(trip.ruta_segmentos) ? trip.ruta_segmentos : [],
      funcionarios: Array.isArray(trip.funcionarios) ? trip.funcionarios : [],
      school_name: school?.["NOMBRE ESTABLECIMIENTO"]?.trim() || `RBD ${trip.rbd}`,
      school_comuna: school?.COMUNA?.trim() || "Comuna no disponible",
      school_address: school?.DIRECCIÓN?.trim() || "Direccion no disponible",
      school_lat: parseCoordinate(school?.LATITUD ?? null),
      school_lng: parseCoordinate(school?.LONGITUD ?? null),
      director_email: directorMap.get(trip.rbd) ?? null,
    } satisfies AdminTripRecord;
  });
}

export async function getAdminTrips(limit?: number) {
  const { supabase } = await assertRoleAccess(["admin"]);
  let query = supabase
    .from("salidas_pedagogicas")
    .select(
      "id, rbd, fecha, hora_salida, hora_regreso, pme_dimension, pme_subdimension, objetivo, actividad, lugar_nombre, lugar_direccion, lugar_lat, lugar_lng, lugar_comuna, lugar_region, distancia_km, distancia_ida_km, distancia_vuelta_km, duracion_minutos, duracion_ida_minutos, duracion_vuelta_minutos, ruta_polyline, ruta_resumen, ruta_segmentos, monto_referencial, estado, cantidad_estudiantes, cantidad_apoderados, funcionarios, created_at",
    )
    .order("created_at", { ascending: false });

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  const { data: trips, error } = await query.returns<AdminTripQueryRow[]>();

  if (error || !trips?.length) {
    return [] as AdminTripRecord[];
  }

  return enrichTrips(trips);
}

export async function getDirectorTrips() {
  const { supabase, userId } = await assertRoleAccess(["director"]);
  const { data: trips, error } = await supabase
    .from("salidas_pedagogicas")
    .select(
      "id, rbd, fecha, hora_salida, hora_regreso, pme_dimension, pme_subdimension, objetivo, actividad, lugar_nombre, lugar_direccion, lugar_lat, lugar_lng, lugar_comuna, lugar_region, distancia_km, distancia_ida_km, distancia_vuelta_km, duracion_minutos, duracion_ida_minutos, duracion_vuelta_minutos, ruta_polyline, ruta_resumen, ruta_segmentos, estado, cantidad_estudiantes, cantidad_apoderados, funcionarios, created_at",
    )
    .eq("director_id", userId)
    .order("created_at", { ascending: false })
    .returns<AdminTripQueryRow[]>();

  if (error || !trips?.length) {
    return [] as AdminTripRecord[];
  }

  return enrichTrips(trips);
}

export async function getAuthorizedTripById(id: string) {
  const { supabase, userId, role } = await assertRoleAccess(["admin", "director"]);
  let query = supabase
    .from("salidas_pedagogicas")
    .select(
      "id, rbd, fecha, hora_salida, hora_regreso, pme_dimension, pme_subdimension, objetivo, actividad, lugar_nombre, lugar_direccion, lugar_lat, lugar_lng, lugar_comuna, lugar_region, distancia_km, distancia_ida_km, distancia_vuelta_km, duracion_minutos, duracion_ida_minutos, duracion_vuelta_minutos, ruta_polyline, ruta_resumen, ruta_segmentos, estado, cantidad_estudiantes, cantidad_apoderados, funcionarios, created_at",
    )
    .eq("id", id);

  if (role === "director") {
    query = query.eq("director_id", userId);
  }

  const { data: rows, error } = await query.limit(1).returns<AdminTripQueryRow[]>();

  if (error || !rows?.length) {
    return null;
  }

  const [trip] = await enrichTrips(rows);

  return trip ?? null;
}

export function filterTrips(trips: AdminTripRecord[], filters: TripQueryFilters) {
  const normalizedSearch = filters.search?.trim().toLowerCase() ?? "";

  return trips.filter((trip) => {
    const matchesRbd = filters.rbd ? trip.rbd === filters.rbd : true;
    const matchesEstado = filters.estado && filters.estado !== "all" ? trip.estado === filters.estado : true;
    const matchesSearch = normalizedSearch
      ? [trip.school_name, trip.actividad, trip.lugar_nombre, trip.pme_dimension, trip.pme_subdimension, trip.director_email ?? "", trip.rbd]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)
      : true;

    return matchesRbd && matchesEstado && matchesSearch;
  });
}

export function serializeTripFilters(filters: TripQueryFilters) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.rbd?.trim()) {
    params.set("rbd", filters.rbd.trim());
  }

  if (filters.estado && filters.estado !== "all") {
    params.set("estado", filters.estado);
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export function buildTripsCsv(trips: AdminTripRecord[]) {
  const headers = [
    "id",
    "fecha",
    "hora_salida",
    "hora_regreso",
    "estado",
    "rbd",
    "establecimiento",
    "comuna_establecimiento",
    "director_email",
    "pme_dimension",
    "pme_subdimension",
    "actividad",
    "objetivo",
    "lugar_nombre",
    "lugar_direccion",
    "lugar_comuna",
    "lugar_region",
    "distancia_km",
    "distancia_ida_km",
    "distancia_vuelta_km",
    "duracion_minutos",
    "duracion_ida_minutos",
    "duracion_vuelta_minutos",
    "cantidad_estudiantes",
    "cantidad_apoderados",
    "ruta_resumen",
    "funcionarios_json",
    "created_at",
  ];

  const sanitizeFormula = (text: string) =>
    /^[=+\-@|]/.test(text) ? `'${text}` : text;

  const escapeCsv = (value: string | number | null) => {
    const text = sanitizeFormula(String(value ?? "")).replace(/"/g, '""');
    return `"${text}"`;
  };

  const rows = trips.map((trip) => [
    trip.id,
    trip.fecha,
    trip.hora_salida,
    trip.hora_regreso,
    trip.estado,
    trip.rbd,
    trip.school_name,
    trip.school_comuna,
    trip.director_email,
    trip.pme_dimension,
    trip.pme_subdimension,
    trip.actividad,
    trip.objetivo,
    trip.lugar_nombre,
    trip.lugar_direccion,
    trip.lugar_comuna,
    trip.lugar_region,
    trip.distancia_km,
    trip.distancia_ida_km,
    trip.distancia_vuelta_km,
    trip.duracion_minutos,
    trip.duracion_ida_minutos,
    trip.duracion_vuelta_minutos,
    trip.cantidad_estudiantes,
    trip.cantidad_apoderados,
    trip.ruta_resumen,
    JSON.stringify(trip.funcionarios),
    trip.created_at,
  ]);

  return [headers, ...rows].map((row) => row.map((cell) => escapeCsv(cell)).join(",")).join("\n");
}
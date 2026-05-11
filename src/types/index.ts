export type UserRole = "director" | "admin";

export interface WhitelistUser {
  id: string;
  email: string;
  rol: UserRole;
  rbd: string | null;
  activo: boolean;
  created_at: string;
}

export interface SchoolRecord {
  RBD: string | null;
  "NOMBRE ESTABLECIMIENTO": string | null;
  COMUNA: string | null;
  "DIRECTOR/A": string | null;
  "CORREO ELECTRÓNICO": string | null;
  LATITUD: string | null;
  LONGITUD: string | null;
  DIRECCIÓN: string | null;
}

export interface PublicRouteRecord {
  id: string;
  lugar_nombre: string;
  lugar_direccion: string;
  lugar_lat: number;
  lugar_lng: number;
  lugar_comuna: string;
  lugar_region: string;
  distancia_km: number;
  duracion_minutos: number;
  ruta_polyline: string;
  ruta_resumen: string;
  ruta_imagen_url: string | null;
  fecha: string;
  rbd: string;
}

export interface DirectorSchoolProfile {
  rbd: string;
  nombre: string;
  comuna: string;
  direccion: string;
  director: string;
  email: string;
  latitud: number;
  longitud: number;
}

export interface SchoolOption {
  rbd: string;
  nombre: string;
  comuna: string;
}

export interface RoutePoint {
  lat: number;
  lng: number;
}

export type DestinationFlow = "single" | "multiple";

export interface RouteStop extends RoutePoint {
  placeId: string;
  name: string;
  address: string;
  comuna: string;
  region: string;
}

export interface RouteSegment {
  id: string;
  label: string;
  kind: "outbound" | "return";
  order: number;
  distanceKm: number;
  durationMinutes: number;
  startLabel: string;
  endLabel: string;
  path: RoutePoint[];
}

export interface RouteCalculationInput {
  origen: RoutePoint;
  destinos: RouteStop[];
}

export interface RouteCalculationResult {
  distancia_km: number;
  duracion_minutos: number;
  distancia_ida_km: number;
  distancia_vuelta_km: number;
  duracion_ida_minutos: number;
  duracion_vuelta_minutos: number;
  polyline: string;
  resumen: string;
  destinos: RouteStop[];
  segmentos: RouteSegment[];
}

export interface RouteCalculationResponse {
  route: RouteCalculationResult | null;
  error: string | null;
}

export interface TripStaffMember {
  nombre_completo: string;
  rut: string;
  cargo: string;
}

export interface PmeSubdimensionOption {
  value: string;
  label: string;
}

export interface PmeDimensionOption {
  value: string;
  label: string;
  sourceDimension: string;
  subdimensions: PmeSubdimensionOption[];
}

export interface SaveTripResponse {
  tripId: string | null;
  error: string | null;
}

export interface TripDraftFormValues {
  fecha: string;
  hora_salida: string;
  hora_regreso: string;
  pme_dimension: string;
  pme_dimension_label: string;
  pme_dimension_source: string;
  pme_subdimension: string;
  pme_subdimension_label: string;
  cantidad_estudiantes: number;
  cantidad_apoderados: number;
  funcionarios: TripStaffMember[];
  objetivo: string;
  actividad: string;
  destino_flujo: DestinationFlow;
  cantidad_destinos: string;
  lugares_json: string;
  lugar_query: string;
  lugar_nombre: string;
  lugar_direccion: string;
  lugar_lat: string;
  lugar_lng: string;
  lugar_place_id: string;
  lugar_comuna: string;
  lugar_region: string;
  distancia_km: string;
  distancia_ida_km: string;
  distancia_vuelta_km: string;
  duracion_minutos: string;
  duracion_ida_minutos: string;
  duracion_vuelta_minutos: string;
  ruta_polyline: string;
  ruta_resumen: string;
}
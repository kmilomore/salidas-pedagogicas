export type UserRole = "director" | "admin";

export type AdminDecisionStatus = "pendiente" | "aceptada" | "rechazada";

export type AuditSeverity = "info" | "warning" | "error";
export type AdminTransportMode = "taxi_bus" | "bus";

export interface PortalAuditEvent {
  id: string;
  created_at: string;
  actor_user_id: string | null;
  actor_email: string | null;
  actor_role: UserRole | "system" | null;
  event_type: string;
  severity: AuditSeverity;
  route: string | null;
  target_type: string | null;
  target_id: string | null;
  target_label: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
}

export interface OperationalSecurityCheck {
  id: string;
  label: string;
  status: "ok" | "warning" | "critical";
  description: string;
  isSensitive: boolean;
}

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

export interface AdminTripRecord {
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
  distancia_ida_km: number;
  distancia_vuelta_km: number;
  duracion_minutos: number;
  duracion_ida_minutos: number;
  duracion_vuelta_minutos: number;
  ruta_polyline: string;
  ruta_resumen: string;
  ruta_segmentos: RouteSegment[];
  tipo_transporte_referencial: AdminTransportMode | null;
  cantidad_buses_referencial: number | null;
  valor_unitario_bus_referencial: number | null;
  monto_referencial: number | null;
  decision_admin: AdminDecisionStatus;
  estado: "borrador" | "enviada";
  cantidad_estudiantes: number;
  cantidad_apoderados: number;
  requerimientos_adicionales: string | null;
  funcionarios: TripStaffMember[];
  created_at: string;
  school_name: string;
  school_comuna: string;
  school_address: string;
  school_lat: number | null;
  school_lng: number | null;
  director_email: string | null;
}

export interface TripQueryFilters {
  search?: string;
  rbd?: string;
  estado?: "borrador" | "enviada" | "all";
  decision_admin?: AdminDecisionStatus | "all";
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
  requerimientos_adicionales: string;
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
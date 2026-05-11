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

export interface RouteCalculationInput {
  origen: RoutePoint;
  destino: RoutePoint;
}

export interface RouteCalculationResult {
  distancia_km: number;
  duracion_minutos: number;
  polyline: string;
  resumen: string;
}

export interface RouteCalculationResponse {
  route: RouteCalculationResult | null;
  error: string | null;
}

export interface TripDraftFormValues {
  fecha: string;
  hora_salida: string;
  hora_regreso: string;
  objetivo: string;
  actividad: string;
  lugar_query: string;
  lugar_nombre: string;
  lugar_direccion: string;
  lugar_lat: string;
  lugar_lng: string;
  lugar_place_id: string;
  lugar_comuna: string;
  lugar_region: string;
  distancia_km: string;
  duracion_minutos: string;
  ruta_polyline: string;
  ruta_resumen: string;
}
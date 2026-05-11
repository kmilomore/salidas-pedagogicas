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
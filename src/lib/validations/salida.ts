import { z } from "zod";

import { normalizeMultilineText, normalizeRutForStorage, normalizeSingleLineText } from "@/lib/input-normalization";

const rutPattern = /^\d{1,8}-[\dkK]$/;

export { formatRut } from "@/lib/input-normalization";
export const normalizeRut = normalizeRutForStorage;

export function isValidRut(value: string) {
  const normalized = normalizeRutForStorage(value);

  if (!rutPattern.test(normalized)) {
    return false;
  }

  const [body, verifier] = normalized.split("-");
  const reversedDigits = body
    .split("")
    .reverse()
    .map((digit) => Number(digit));

  let multiplier = 2;
  let total = 0;

  for (const digit of reversedDigits) {
    total += digit * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (total % 11);
  const expectedVerifier = remainder === 11 ? "0" : remainder === 10 ? "K" : String(remainder);

  return expectedVerifier === verifier.toUpperCase();
}

export const funcionarioSchema = z.object({
  nombre_completo: z.string().transform(normalizeSingleLineText).pipe(z.string().min(5, "El nombre del funcionario debe tener al menos 5 caracteres.")),
  rut: z
    .string()
    .transform(normalizeRutForStorage)
    .pipe(z.string().min(1, "Ingresa el RUT del funcionario."))
    .refine((value) => isValidRut(value), "Ingresa un RUT chileno valido."),
  cargo: z.string().transform(normalizeSingleLineText).pipe(z.string().min(3, "Ingresa el cargo del funcionario.")),
});

const routePointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const routeSegmentSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  kind: z.enum(["outbound", "return"]),
  order: z.number().int().min(0),
  distanceKm: z.number().nonnegative(),
  durationMinutes: z.number().int().nonnegative(),
  startLabel: z.string().min(1),
  endLabel: z.string().min(1),
  path: z.array(routePointSchema).min(1),
});

export const salidaSchema = z.object({
  rbd: z.string().transform(normalizeSingleLineText).pipe(z.string().min(1)),
  fecha: z.string().transform(normalizeSingleLineText).pipe(z.string().min(1, "Selecciona la fecha de la salida.")),
  hora_salida: z.string().transform(normalizeSingleLineText).pipe(z.string().min(1, "Ingresa la hora de salida.")),
  hora_regreso: z.string().transform(normalizeSingleLineText).optional().or(z.literal("")),
  pme_dimension: z.string().transform(normalizeSingleLineText).pipe(z.string().min(1, "Selecciona la dimension del PME.")),
  pme_subdimension: z.string().transform(normalizeSingleLineText).pipe(z.string().min(1, "Selecciona la subdimension del PME.")),
  actividad: z.string().transform(normalizeSingleLineText).pipe(z.string().min(5, "Ingresa el nombre de la accion.")),
  objetivo: z.string().transform(normalizeMultilineText).pipe(z.string().min(10, "Describe el objetivo pedagogico.")),
  lugar_nombre: z.string().transform(normalizeSingleLineText).pipe(z.string().min(1)),
  lugar_direccion: z.string().transform(normalizeSingleLineText).pipe(z.string().min(1)),
  lugar_lat: z.coerce.number(),
  lugar_lng: z.coerce.number(),
  lugar_place_id: z.string().transform(normalizeSingleLineText).pipe(z.string().min(1)),
  lugar_comuna: z.string().transform(normalizeSingleLineText).pipe(z.string().min(1)),
  lugar_region: z.string().transform(normalizeSingleLineText).pipe(z.string().min(1)),
  distancia_km: z.coerce.number().nonnegative(),
  distancia_ida_km: z.coerce.number().nonnegative(),
  distancia_vuelta_km: z.coerce.number().nonnegative(),
  duracion_minutos: z.coerce.number().int().nonnegative(),
  duracion_ida_minutos: z.coerce.number().int().nonnegative(),
  duracion_vuelta_minutos: z.coerce.number().int().nonnegative(),
  ruta_polyline: z.string().transform(normalizeSingleLineText).pipe(z.string().min(1)),
  ruta_resumen: z.string().transform(normalizeSingleLineText).pipe(z.string().min(1)),
  ruta_segmentos: z.array(routeSegmentSchema).min(1, "La ruta debe incluir al menos un segmento."),
  cantidad_estudiantes: z.coerce.number().int().min(1, "Ingresa al menos 1 estudiante."),
  cantidad_apoderados: z.coerce.number().int().min(0, "La cantidad de apoderados no puede ser negativa."),
  requerimientos_adicionales: z.string().transform(normalizeMultilineText).optional().default(""),
  funcionarios: z.array(funcionarioSchema).min(1, "Debes registrar al menos un funcionario."),
});

export type SalidaSchemaInput = z.input<typeof salidaSchema>;
export type SalidaSchema = z.infer<typeof salidaSchema>;
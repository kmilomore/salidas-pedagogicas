import { z } from "zod";

const rutPattern = /^\d{1,8}-[\dkK]$/;

function normalizeRut(value: string) {
  return value.replace(/\./g, "").trim();
}

export function isValidRut(value: string) {
  const normalized = normalizeRut(value);

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
  nombre_completo: z.string().trim().min(5, "El nombre del funcionario debe tener al menos 5 caracteres."),
  rut: z
    .string()
    .trim()
    .min(1, "Ingresa el RUT del funcionario.")
    .refine((value) => isValidRut(value), "Ingresa un RUT chileno valido."),
  cargo: z.string().trim().min(3, "Ingresa el cargo del funcionario."),
});

export const salidaSchema = z.object({
  rbd: z.string().trim().min(1),
  fecha: z.string().trim().min(1, "Selecciona la fecha de la salida."),
  hora_salida: z.string().trim().min(1, "Ingresa la hora de salida."),
  hora_regreso: z.string().trim().optional().or(z.literal("")),
  pme_dimension: z.string().trim().min(1, "Selecciona la dimension del PME."),
  pme_subdimension: z.string().trim().min(1, "Selecciona la subdimension del PME."),
  actividad: z.string().trim().min(5, "Ingresa el nombre de la accion."),
  objetivo: z.string().trim().min(10, "Describe el objetivo pedagogico."),
  lugar_nombre: z.string().trim().min(1),
  lugar_direccion: z.string().trim().min(1),
  lugar_lat: z.coerce.number(),
  lugar_lng: z.coerce.number(),
  lugar_place_id: z.string().trim().min(1),
  lugar_comuna: z.string().trim().min(1),
  lugar_region: z.string().trim().min(1),
  distancia_km: z.coerce.number().nonnegative(),
  duracion_minutos: z.coerce.number().int().nonnegative(),
  ruta_polyline: z.string().trim().min(1),
  ruta_resumen: z.string().trim().min(1),
  cantidad_estudiantes: z.coerce.number().int().min(1, "Ingresa al menos 1 estudiante."),
  cantidad_apoderados: z.coerce.number().int().min(0, "La cantidad de apoderados no puede ser negativa."),
  funcionarios: z.array(funcionarioSchema).min(1, "Debes registrar al menos un funcionario."),
});

export type SalidaSchemaInput = z.input<typeof salidaSchema>;
export type SalidaSchema = z.infer<typeof salidaSchema>;
const CHILE_TIME_ZONE = "America/Santiago";

function toValidDate(value: string | Date) {
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatChileDateTime(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = { dateStyle: "short", timeStyle: "short" },
) {
  const parsed = toValidDate(value);

  if (!parsed) {
    return String(value);
  }

  return new Intl.DateTimeFormat("es-CL", {
    timeZone: CHILE_TIME_ZONE,
    ...options,
  }).format(parsed);
}

export function formatChileDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" },
) {
  return formatChileDateTime(value, options);
}

export function formatChileDateFromIsoDate(
  value: string,
  options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" },
) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  // Use UTC noon so date-only values stay on the same calendar day after Chile TZ conversion.
  const parsed = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return formatChileDate(parsed, options);
}
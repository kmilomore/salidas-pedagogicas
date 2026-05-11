function stripControlCharacters(value: string) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

function normalizeUnicode(value: string) {
  return value.normalize("NFKC");
}

export function normalizeSingleLineText(value: string) {
  return stripControlCharacters(normalizeUnicode(value))
    .replace(/[<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeMultilineText(value: string) {
  return stripControlCharacters(normalizeUnicode(value))
    .replace(/[<>]/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/[\t\f\v]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .join("\n")
    .trim();
}

export function normalizeNumericText(value: string) {
  return value.replace(/\D/g, "").trim();
}

export function normalizeRutRaw(value: string) {
  return normalizeUnicode(value)
    .replace(/\./g, "")
    .replace(/-/g, "")
    .replace(/\s+/g, "")
    .toUpperCase();
}

export function normalizeRutForStorage(value: string) {
  const raw = normalizeRutRaw(value);

  if (raw.length <= 1) {
    return raw;
  }

  return `${raw.slice(0, -1)}-${raw.slice(-1)}`;
}

export function formatRut(value: string) {
  const normalized = normalizeRutForStorage(value);

  if (!normalized.includes("-")) {
    return normalized;
  }

  const [body, verifier] = normalized.split("-");
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${formattedBody}-${verifier}`;
}
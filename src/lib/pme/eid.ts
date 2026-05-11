import type { PmeDimensionOption } from "@/types";

interface EidRecord {
  dimension: string;
  sub_dimension: string;
}

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

function toDisplayLabel(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function buildPmeDimensions(records: EidRecord[]) {
  const grouped = new Map<string, Set<string>>();

  for (const record of records) {
    const dimension = record.dimension?.trim();
    const subdimension = record.sub_dimension?.trim();

    if (!dimension || !subdimension) {
      continue;
    }

    const bucket = grouped.get(dimension) ?? new Set<string>();
    bucket.add(subdimension);
    grouped.set(dimension, bucket);
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right, "es"))
    .map(([dimension, subdimensions]) => ({
      value: toSlug(dimension),
      label: toDisplayLabel(dimension),
      sourceDimension: dimension,
      subdimensions: Array.from(subdimensions)
        .sort((left, right) => left.localeCompare(right, "es"))
        .map((subdimension) => ({
          value: toSlug(subdimension),
          label: toDisplayLabel(subdimension),
        })),
    })) satisfies PmeDimensionOption[];
}

export function getPmeDimensionByValue(dimensions: PmeDimensionOption[], value: string) {
  return dimensions.find((dimension) => dimension.value === value) ?? null;
}
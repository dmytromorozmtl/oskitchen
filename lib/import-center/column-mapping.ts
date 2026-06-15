import type { ImportType } from "@prisma/client";

import { importTemplate } from "@/lib/import-center/import-templates";

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * Suggests a canonical → CSV header mapping for the given import type.
 * Honours both the canonical field key and any aliases declared on the
 * template definition.
 */
export function suggestImportMapping(
  type: ImportType,
  headers: string[],
): Record<string, string> {
  const spec = importTemplate(type);
  const headerNorms = headers.map((h) => ({ raw: h, norm: normalize(h) }));
  const out: Record<string, string> = {};
  for (const field of spec.fields) {
    const candidates = [field.key, ...(field.aliases ?? [])].map(normalize);
    const hit = headerNorms.find((h) =>
      candidates.includes(h.norm) ||
      candidates.some((c) => h.norm === `${c}name` || h.norm.endsWith(c)),
    );
    if (hit) out[field.key] = hit.raw;
  }
  return out;
}

export function missingRequiredColumns(
  type: ImportType,
  mapping: Record<string, string>,
): string[] {
  const required = importTemplate(type).fields.filter((f) => f.required).map((f) => f.key);
  return required.filter((key) => !mapping[key]);
}

export function applyMapping(
  row: Record<string, string>,
  mapping: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [canonical, header] of Object.entries(mapping)) {
    if (!header) continue;
    out[canonical] = (row[header] ?? "").trim();
  }
  return out;
}

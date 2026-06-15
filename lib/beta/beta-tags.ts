/** Canonical internal tag list (subset; custom strings allowed in storage). */
export const BETA_SUGGESTED_TAGS = [
  "case-study",
  "high-arr",
  "multi-location",
  "spreadsheet-native",
  "enterprise",
  "design-partner",
  "regional-launch",
  "feature-alpha",
] as const;

export type BetaInternalTag = (typeof BETA_SUGGESTED_TAGS)[number] | string;

export function parseInternalTags(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x).trim()).filter(Boolean).slice(0, 40);
  }
  return [];
}

export function stringifyTagsForForm(tags: string[]): string {
  return tags.join(", ");
}

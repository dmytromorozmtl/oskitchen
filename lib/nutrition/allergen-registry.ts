/**
 * Canonical allergen keys for structured profiles (UI + JSON storage).
 * KitchenOS does not map these to any jurisdiction — operators must confirm legal declarations locally.
 */
export const STANDARD_ALLERGEN_KEYS = [
  "milk",
  "eggs",
  "fish",
  "shellfish",
  "tree_nuts",
  "peanuts",
  "wheat",
  "soy",
  "sesame",
  "sulfites",
  "mustard",
  "celery",
  "gluten",
  "alcohol_notes",
] as const;

export type StandardAllergenKey = (typeof STANDARD_ALLERGEN_KEYS)[number];

export const STANDARD_ALLERGEN_LABELS: Record<StandardAllergenKey, string> = {
  milk: "Milk",
  eggs: "Eggs",
  fish: "Fish",
  shellfish: "Shellfish",
  tree_nuts: "Tree nuts",
  peanuts: "Peanuts",
  wheat: "Wheat",
  soy: "Soy",
  sesame: "Sesame",
  sulfites: "Sulfites",
  mustard: "Mustard",
  celery: "Celery",
  gluten: "Gluten",
  alcohol_notes: "Alcohol / mixer notes",
};

/** Accept legacy free-text tokens and normalize to registry keys where possible. */
export function normalizeAllergenToken(raw: string): string {
  const t = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (t === "tree" || t === "nuts") return "tree_nuts";
  if (t === "shellfish" || t === "crustaceans") return "shellfish";
  return t.replace(/-/g, "_");
}

export function parseAllergenListCsv(csv: string): string[] {
  const out = new Set<string>();
  for (const part of csv.split(/[,;\n]/)) {
    const n = normalizeAllergenToken(part);
    if (n) out.add(n);
  }
  return [...out];
}

export function displayAllergenKey(key: string): string {
  if ((STANDARD_ALLERGEN_KEYS as readonly string[]).includes(key)) {
    return STANDARD_ALLERGEN_LABELS[key as StandardAllergenKey];
  }
  return key.replace(/_/g, " ");
}

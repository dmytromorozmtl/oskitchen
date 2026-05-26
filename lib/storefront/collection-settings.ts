/** Parsed from Menu.storefrontSettingsJson for collection landing pages. */
export type CollectionStorefrontSettings = {
  heroImageUrl?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
};

export function parseCollectionStorefrontSettings(raw: unknown): CollectionStorefrontSettings {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  return {
    heroImageUrl: typeof o.heroImageUrl === "string" ? o.heroImageUrl : null,
    heroTitle: typeof o.heroTitle === "string" ? o.heroTitle : null,
    heroSubtitle: typeof o.heroSubtitle === "string" ? o.heroSubtitle : null,
  };
}

/** Dietary filter tokens matched against product.allergens (case-insensitive substring). */
export const COLLECTION_DIETARY_FILTERS = [
  { id: "vegan", label: "Vegan", match: ["vegan"] },
  { id: "vegetarian", label: "Vegetarian", match: ["vegetarian"] },
  { id: "gluten-free", label: "Gluten-free", match: ["gluten-free", "gluten free"] },
  { id: "nut-free", label: "Nut-free", match: ["nut-free", "nut free", "peanut"] },
] as const;

export type CollectionSort = "default" | "price-asc" | "price-desc" | "title";

export function productMatchesDietaryFilter(allergens: string | null, filterId: string): boolean {
  const spec = COLLECTION_DIETARY_FILTERS.find((f) => f.id === filterId);
  if (!spec) return true;
  const hay = (allergens ?? "").toLowerCase();
  if (!hay.trim()) return false;
  return spec.match.some((m) => hay.includes(m));
}

export function sortCollectionProducts<T extends { title: string; price: number; sortOrder: number }>(
  products: T[],
  sort: CollectionSort,
): T[] {
  const copy = [...products];
  if (sort === "price-asc") return copy.sort((a, b) => a.price - b.price || a.title.localeCompare(b.title));
  if (sort === "price-desc") return copy.sort((a, b) => b.price - a.price || a.title.localeCompare(b.title));
  if (sort === "title") return copy.sort((a, b) => a.title.localeCompare(b.title));
  return copy.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
}

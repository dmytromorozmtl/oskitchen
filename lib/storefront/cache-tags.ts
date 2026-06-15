/** Next.js cache tags for storefront — pair with revalidateTag() on publish. */

export const STOREFRONT_MARKET_COOKIE = "kos_market";

/** Base catalog tag (all markets) — kept for backward-compatible purge. */
export function storefrontCatalogTag(storeSlug: string, marketId?: string | null): string {
  const m = marketId?.trim();
  if (m && m !== "default") return `sf-catalog-${storeSlug}-${m}`;
  return `sf-catalog-${storeSlug}`;
}

export function storefrontThemeTag(storeSlug: string): string {
  return `sf-theme-${storeSlug}`;
}

export function storefrontSettingsTag(storeSlug: string): string {
  return `sf-settings-${storeSlug}`;
}

export function allStorefrontTags(storeSlug: string): string[] {
  return [storefrontCatalogTag(storeSlug), storefrontThemeTag(storeSlug), storefrontSettingsTag(storeSlug)];
}

/** All catalog tags for a storefront including per-market variants. */
export function allStorefrontCatalogTags(storeSlug: string, marketIds: string[]): string[] {
  const tags = new Set<string>([storefrontCatalogTag(storeSlug)]);
  for (const id of marketIds) {
    const m = id?.trim();
    if (m && m !== "default") tags.add(storefrontCatalogTag(storeSlug, m));
  }
  return [...tags];
}

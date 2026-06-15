import {
  dispatchMarketplaceCatalogTrayChange,
  MARKETPLACE_COMPARE_CHANGE_EVENT,
  MARKETPLACE_COMPARE_LIMIT,
  MARKETPLACE_COMPARE_STORAGE_KEY,
} from "@/lib/marketplace/marketplace-catalog-ux-policy";

export {
  MARKETPLACE_COMPARE_LIMIT,
  MARKETPLACE_COMPARE_STORAGE_KEY,
} from "@/lib/marketplace/marketplace-catalog-ux-policy";

export function readMarketplaceCompareSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(MARKETPLACE_COMPARE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeMarketplaceCompareSlugs(slugs: string[]): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    MARKETPLACE_COMPARE_STORAGE_KEY,
    JSON.stringify(slugs.slice(0, MARKETPLACE_COMPARE_LIMIT)),
  );
  dispatchMarketplaceCatalogTrayChange(MARKETPLACE_COMPARE_CHANGE_EVENT);
}

export function toggleMarketplaceCompareSlug(slug: string): {
  compared: boolean;
  slugs: string[];
} {
  const current = readMarketplaceCompareSlugs();
  const compared = !current.includes(slug);
  const next = compared
    ? current.length >= MARKETPLACE_COMPARE_LIMIT
      ? current
      : [...current, slug]
    : current.filter((value) => value !== slug);
  writeMarketplaceCompareSlugs(next);
  return { compared: next.includes(slug), slugs: next };
}

export function isMarketplaceCompareSlug(slug: string): boolean {
  return readMarketplaceCompareSlugs().includes(slug);
}

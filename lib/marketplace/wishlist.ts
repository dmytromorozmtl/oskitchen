export const MARKETPLACE_WISHLIST_KEY = "marketplace-wishlist-slugs";

export function readMarketplaceWishlistSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MARKETPLACE_WISHLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export function writeMarketplaceWishlistSlugs(slugs: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MARKETPLACE_WISHLIST_KEY, JSON.stringify(slugs));
}

export function removeMarketplaceWishlistSlug(slug: string): string[] {
  const next = readMarketplaceWishlistSlugs().filter((value) => value !== slug);
  writeMarketplaceWishlistSlugs(next);
  return next;
}

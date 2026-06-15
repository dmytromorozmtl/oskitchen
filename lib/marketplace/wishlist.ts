import {
  dispatchMarketplaceCatalogTrayChange,
  MARKETPLACE_WISHLIST_CHANGE_EVENT,
  MARKETPLACE_WISHLIST_KEY,
} from "@/lib/marketplace/marketplace-catalog-ux-policy";

export { MARKETPLACE_WISHLIST_KEY } from "@/lib/marketplace/marketplace-catalog-ux-policy";

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
  dispatchMarketplaceCatalogTrayChange(MARKETPLACE_WISHLIST_CHANGE_EVENT);
}

export function removeMarketplaceWishlistSlug(slug: string): string[] {
  const next = readMarketplaceWishlistSlugs().filter((value) => value !== slug);
  writeMarketplaceWishlistSlugs(next);
  return next;
}

export function isMarketplaceWishlistSlug(slug: string): boolean {
  return readMarketplaceWishlistSlugs().includes(slug);
}

export function addMarketplaceWishlistSlug(slug: string): string[] {
  const current = readMarketplaceWishlistSlugs();
  if (current.includes(slug)) return current;
  const next = [...current, slug];
  writeMarketplaceWishlistSlugs(next);
  return next;
}

export function toggleMarketplaceWishlistSlug(slug: string): {
  wishlisted: boolean;
  slugs: string[];
} {
  const current = readMarketplaceWishlistSlugs();
  const wishlisted = !current.includes(slug);
  const next = wishlisted
    ? [...current, slug]
    : current.filter((value) => value !== slug);
  writeMarketplaceWishlistSlugs(next);
  return { wishlisted, slugs: next };
}

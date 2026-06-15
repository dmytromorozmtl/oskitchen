/** Shared Tailwind classes for touch-friendly marketplace controls (44px min target). */
export const MARKETPLACE_TOUCH_INPUT_CLASS = "min-h-11 text-base sm:text-sm";

export const MARKETPLACE_TOUCH_BUTTON_CLASS = "min-h-11 px-4";

export const MARKETPLACE_MOBILE_CARD_CLASS =
  "rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm";

export const OFFLINE_CATALOG_STORAGE_KEY = "kitchenos-marketplace-offline-catalog-v1";

export type OfflineCatalogProduct = {
  id: string;
  slug: string;
  name: string;
  vendorName: string;
  basePrice: number;
  currency: string;
  cachedAt: string;
};

export function saveOfflineCatalogProducts(products: OfflineCatalogProduct[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      OFFLINE_CATALOG_STORAGE_KEY,
      JSON.stringify({ products: products.slice(0, 120), savedAt: new Date().toISOString() }),
    );
  } catch {
    // ignore quota errors
  }
}

export function loadOfflineCatalogProducts(): OfflineCatalogProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(OFFLINE_CATALOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { products?: OfflineCatalogProduct[] };
    return Array.isArray(parsed.products) ? parsed.products : [];
  } catch {
    return [];
  }
}

export function isMarketplaceOfflineMode(): boolean {
  if (typeof window === "undefined") return false;
  return !window.navigator.onLine;
}

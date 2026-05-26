/** Cart persisted in the browser for public storefronts. */

export const STOREFRONT_CART_PREFIX = "kitchenos-store-cart-v2-";

export function cartStorageKey(storeSlug: string) {
  return `${STOREFRONT_CART_PREFIX}${storeSlug}`;
}

export type StoreCartLine = { productId: string; quantity: number };

export function readCartFromStorage(storeSlug: string): Record<string, number> {
  if (typeof window === "undefined") return {};
  const key = cartStorageKey(storeSlug);
  const tryParse = (raw: string | null) => {
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw) as Record<string, number>;
      return typeof parsed === "object" && parsed ? parsed : {};
    } catch {
      return {};
    }
  };
  const fromLocal = tryParse(localStorage.getItem(key));
  if (Object.keys(fromLocal).length > 0) return fromLocal;
  const legacy = tryParse(sessionStorage.getItem(`kitchenos-store-cart-${storeSlug}`));
  if (Object.keys(legacy).length > 0) {
    localStorage.setItem(key, JSON.stringify(legacy));
    sessionStorage.removeItem(`kitchenos-store-cart-${storeSlug}`);
  }
  return legacy;
}

export function writeCartToStorage(storeSlug: string, cart: Record<string, number>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(cartStorageKey(storeSlug), JSON.stringify(cart));
}

export function clearCartStorage(storeSlug: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(cartStorageKey(storeSlug));
  sessionStorage.removeItem(`kitchenos-store-cart-${storeSlug}`);
}

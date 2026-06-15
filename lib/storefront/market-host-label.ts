/** Pure host-label helpers (safe for client bundles — no next/headers). */

/** Vanity host label: `{storeSlug}-{marketId}` e.g. hello-weekday.kitchenos.com */
export function compositeMarketHostLabel(storeSlug: string, marketId: string): string {
  return `${storeSlug}-${marketId}`.toLowerCase();
}

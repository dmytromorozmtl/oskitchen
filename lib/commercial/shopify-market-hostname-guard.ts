import { compositeMarketHostLabel } from "@/lib/storefront/market-host-resolve";

export const SHOPIFY_MARKET_HOSTNAME_GUARD_HONESTY =
  "Shopify hostname hints never change DNS automatically — apply suggested subdomains manually or via hostnameAuthority reconcile.";

export function isShopifyMarketsHostnameGuardEnabled(): boolean {
  if (process.env.SHOPIFY_MARKETS_HOSTNAME_GUARD === "1") return true;
  return process.env.NODE_ENV !== "production";
}

/** Normalize Shopify market handle → vanity host label (a-z0-9-). */
export function normalizeShopifyHandleToHostLabel(
  handle: string | null | undefined,
  fallbackMarketId: string,
): string {
  const raw = (handle?.trim() || fallbackMarketId).toLowerCase();
  const normalized = raw
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 63);
  return normalized.length >= 2 ? normalized : fallbackMarketId.toLowerCase().slice(0, 63);
}

export function suggestMarketHostSubdomain(input: {
  storeSlug: string;
  osMarketId: string;
  shopifyHandle: string | null | undefined;
}): string {
  const slug = input.storeSlug.trim().toLowerCase();
  if (input.shopifyHandle?.trim()) {
    const handleLabel = normalizeShopifyHandleToHostLabel(input.shopifyHandle, input.osMarketId);
    if (handleLabel === slug || handleLabel.startsWith(`${slug}-`)) {
      return handleLabel;
    }
    return `${slug}-${handleLabel}`.slice(0, 63);
  }
  return compositeMarketHostLabel(slug, input.osMarketId);
}

export function suggestMarketStoreSlug(input: {
  primaryStoreSlug: string;
  shopifyHandle: string | null | undefined;
  osMarketId: string;
}): string {
  const primary = input.primaryStoreSlug.trim().toLowerCase();
  if (!input.shopifyHandle?.trim()) {
    return primary;
  }
  const handleLabel = normalizeShopifyHandleToHostLabel(input.shopifyHandle, input.osMarketId);
  if (handleLabel === primary) return primary;
  return `${primary}-${handleLabel}`.slice(0, 120);
}

export function hostLabelsMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const left = a?.trim().toLowerCase() ?? "";
  const right = b?.trim().toLowerCase() ?? "";
  if (!left || !right) return false;
  return left === right;
}

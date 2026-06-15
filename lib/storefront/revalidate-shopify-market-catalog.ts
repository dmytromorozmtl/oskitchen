import { createHash } from "crypto";

import { revalidateTag } from "next/cache";

import { allStorefrontCatalogTags } from "@/lib/storefront/cache-tags";
import { loadMarketsForStorefrontOwner } from "@/lib/storefront/market-resolve";
import { prisma } from "@/lib/prisma";

export async function revalidateStorefrontCatalogForOwner(userId: string): Promise<string | null> {
  const sf = await prisma.storefrontSettings.findFirst({
    where: { userId, enabled: true },
    select: { storeSlug: true },
  });
  if (!sf?.storeSlug) return null;

  const markets = await loadMarketsForStorefrontOwner(userId);
  for (const tag of allStorefrontCatalogTags(
    sf.storeSlug,
    markets.map((m) => m.id),
  )) {
    revalidateTag(tag);
  }
  return sf.storeSlug;
}

export function computeShopifyMarketPriceHash(productPrices: Record<string, string>): string {
  const canonical = Object.keys(productPrices)
    .sort()
    .map((productId) => `${productId}:${productPrices[productId]}`)
    .join("|");
  return createHash("sha256").update(canonical).digest("hex").slice(0, 16);
}

export function computeShopifyMarketCatalogHash(productIds: string[]): string {
  const canonical = [...productIds].sort().join("|");
  return createHash("sha256").update(canonical).digest("hex").slice(0, 16);
}

export const SHOPIFY_MARKETS_WEBHOOK_DEBOUNCE_MS = 60_000;

export function isShopifyMarketsWebhookDebounced(
  lastTriggeredAt: string | null | undefined,
  nowMs = Date.now(),
): boolean {
  if (!lastTriggeredAt) return false;
  const elapsed = nowMs - new Date(lastTriggeredAt).getTime();
  return elapsed >= 0 && elapsed < SHOPIFY_MARKETS_WEBHOOK_DEBOUNCE_MS;
}

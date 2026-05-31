import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { STOREFRONT_MARKET_COOKIE, storefrontCatalogTag } from "@/lib/storefront/cache-tags";
import { loadShopifyMarketCatalogOverlayForMarket } from "@/lib/storefront/shopify-market-catalog-overrides";
import { loadShopifyMarketTaxOverlayForMarket } from "@/lib/storefront/shopify-market-tax-overrides";
import { loadShopifyMarketHostnameOverlayForMarket } from "@/lib/storefront/shopify-market-hostname-overrides";
import {
  defaultPilotMarket,
  parseStorefrontMarketsFromSettingsCenter,
  type StorefrontMarket,
} from "@/lib/storefront/markets";

export type ResolvedMarketContext = {
  market: StorefrontMarket;
  markets: StorefrontMarket[];
  productIds: string[] | null;
  activeMenuId: string | null;
  effectiveStoreSlug: string;
  /** Checkout tax source — always kitchenos; shopify_reference when import hints exist */
  taxSource: "kitchenos" | "shopify_reference";
  /** Hostname routing hint source — shopify_reference when cached import exists */
  hostnameSource: "kitchenos" | "shopify_reference";
  suggestedHostSubdomain: string | null;
};

export async function loadMarketsForStorefrontOwner(userId: string): Promise<StorefrontMarket[]> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });
  const markets = parseStorefrontMarketsFromSettingsCenter(kitchen?.settingsCenterJson);
  return markets.filter((m) => m.enabled !== false);
}

export async function resolveActiveMarket(input: {
  storeSlug: string;
  storefrontUserId: string;
  defaultActiveMenuId: string | null;
  currency: string;
  marketIdFromQuery?: string | null;
}): Promise<ResolvedMarketContext> {
  let markets = await loadMarketsForStorefrontOwner(input.storefrontUserId);
  if (markets.length === 0) {
    markets = [defaultPilotMarket(input.storeSlug, input.currency)];
  }

  const jar = await cookies();
  const fromCookie = jar.get(STOREFRONT_MARKET_COOKIE)?.value?.trim();
  const requested = input.marketIdFromQuery?.trim() || fromCookie || markets[0]?.id || "default";

  const market =
    markets.find((m) => m.id === requested && m.enabled !== false) ??
    markets.find((m) => m.enabled !== false) ??
    defaultPilotMarket(input.storeSlug, input.currency);

  const catalogOverlay = await loadShopifyMarketCatalogOverlayForMarket({
    ownerUserId: input.storefrontUserId,
    market,
  });

  const taxOverlay = await loadShopifyMarketTaxOverlayForMarket({
    ownerUserId: input.storefrontUserId,
    market,
  });

  const hostnameOverlay = await loadShopifyMarketHostnameOverlayForMarket({
    ownerUserId: input.storefrontUserId,
    market,
    primaryStoreSlug: input.storeSlug,
    rootDomain: process.env.NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN ?? null,
  });

  const productIds =
    catalogOverlay.productIds ??
    (market.productIds && market.productIds.length > 0 ? market.productIds : null);

  const activeMenuId = market.activeMenuId?.trim() || input.defaultActiveMenuId;

  const effectiveStoreSlug = market.storeSlug?.trim() || input.storeSlug;

  return {
    market,
    markets,
    productIds,
    activeMenuId,
    effectiveStoreSlug,
    taxSource: taxOverlay.source,
    hostnameSource: hostnameOverlay.source,
    suggestedHostSubdomain: hostnameOverlay.importRow?.suggestedHostSubdomain ?? null,
  };
}

/** ISR / unstable_cache key segment per market + menu. */
export function marketCatalogCacheKey(marketId: string, menuId: string | null): string {
  return `${marketId || "default"}:${menuId || "none"}`;
}

export { storefrontCatalogTag };

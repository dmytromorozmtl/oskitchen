import { unstable_cache } from "next/cache";

import { getSessionUser } from "@/lib/auth";
import type { StorefrontMenuCatalog } from "@/lib/storefront/catalog-types";
import { storefrontCatalogTag } from "@/lib/storefront/cache-tags";
import {
  loadMarketsForStorefrontOwner,
  marketCatalogCacheKey,
  resolveActiveMarket,
} from "@/lib/storefront/market-resolve";
import type { StorefrontMarket } from "@/lib/storefront/markets";
import { loadShopifyMarketPriceOverridesForMarket } from "@/lib/storefront/shopify-market-price-overrides";
import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";
import { prisma } from "@/lib/prisma";
import { buildStorefrontMenuCatalog } from "@/services/storefront/storefront-menu-catalog-service";

export type StorefrontCatalogPageData = {
  catalog: StorefrontMenuCatalog;
  currency: string;
  marketId: string;
  marketName: string;
  marketBanner: string | null;
  markets: StorefrontMarket[];
  effectiveStoreSlug: string;
};

async function buildCatalogForStore(input: {
  storefrontId: string;
  storeSlug: string;
  menuId: string;
  currency: string;
  marketId: string;
  productIds: string[] | null;
  productPriceOverrides?: Map<string, number>;
}): Promise<StorefrontMenuCatalog | null> {
  const menu = await prisma.menu.findFirst({
    where: { id: input.menuId },
    select: { id: true, catalogOnly: true },
  });
  if (!menu || menu.catalogOnly) return null;

  return buildStorefrontMenuCatalog({
    storefrontId: input.storefrontId,
    storeSlug: input.storeSlug,
    menuId: input.menuId,
    currency: input.currency,
    marketId: input.marketId,
    marketProductIds: input.productIds,
    productPriceOverrides: input.productPriceOverrides,
  });
}

/**
 * Cached catalog loader — used by menu, PDP, and checkout (pass marketIdFromQuery when present).
 */
export async function loadStorefrontMenuCatalogForPage(
  storeSlug: string,
  marketIdFromQuery?: string | null,
): Promise<StorefrontCatalogPageData | null> {
  const user = await getSessionUser();
  const sf = await getStorefrontForPublicFromRequest(storeSlug, user?.id ?? null);
  if (!sf) return null;

  const { market, productIds, activeMenuId, effectiveStoreSlug } = await resolveActiveMarket({
    storeSlug,
    storefrontUserId: sf.userId,
    defaultActiveMenuId: sf.activeMenuId,
    currency: sf.currency,
    marketIdFromQuery,
  });

  const menuId = activeMenuId ?? sf.activeMenuId;
  if (!menuId) return null;

  const { overrides: productPriceOverrides, importRow } =
    await loadShopifyMarketPriceOverridesForMarket({
      ownerUserId: sf.userId,
      market,
    });

  const cacheKey = marketCatalogCacheKey(market.id, menuId);
  const priceVersionSuffix =
    importRow?.importedAt != null ? `:shopify-${importRow.importedAt}` : ":native";
  const getCached = unstable_cache(
    async () =>
      buildCatalogForStore({
        storefrontId: sf.id,
        storeSlug: sf.storeSlug,
        menuId,
        currency: importRow?.currencyCode ?? market.currency ?? sf.currency,
        marketId: market.id,
        productIds,
        productPriceOverrides,
      }),
    ["sf-menu-catalog", storeSlug, cacheKey, menuId, priceVersionSuffix],
    {
      tags: [storefrontCatalogTag(storeSlug, market.id)],
      revalidate: 60,
    },
  );

  const catalog = await getCached();
  if (!catalog) return null;

  const markets = await loadMarketsForStorefrontOwner(sf.userId);

  return {
    catalog,
    currency: importRow?.currencyCode ?? market.currency ?? sf.currency,
    marketId: market.id,
    marketName: market.name,
    marketBanner: market.bannerText ?? null,
    markets: markets.length > 0 ? markets : [market],
    effectiveStoreSlug,
  };
}

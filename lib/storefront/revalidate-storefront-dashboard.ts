import { revalidatePath, revalidateTag } from "next/cache";

import {
  allStorefrontCatalogTags,
  allStorefrontTags,
  storefrontCatalogTag,
  storefrontSettingsTag,
  storefrontThemeTag,
} from "@/lib/storefront/cache-tags";
import { purgeStorefrontCdnByScope, type StorefrontCdnPurgeScope } from "@/lib/storefront/cdn-purge";
import { loadMarketsForStorefrontOwner } from "@/lib/storefront/market-resolve";

const STATIC_STOREFRONT_ADMIN = [
  "/dashboard/storefront",
  "/dashboard/storefront/launch",
  "/dashboard/storefront/website",
  "/dashboard/storefront/pages",
  "/dashboard/storefront/theme",
  "/dashboard/storefront/menu",
  "/dashboard/storefront/catalog",
  "/dashboard/storefront/markets",
  "/dashboard/storefront/team",
  "/dashboard/storefront/workspace",
  "/dashboard/storefront/products",
  "/dashboard/storefront/ordering",
  "/dashboard/storefront/fulfillment",
  "/dashboard/storefront/forms",
  "/dashboard/storefront/domains",
  "/dashboard/storefront/redirects",
  "/dashboard/storefront/discounts",
  "/dashboard/storefront/gift-cards",
  "/dashboard/storefront/loyalty",
  "/dashboard/storefront/cart-recovery",
  "/dashboard/storefront/reservations",
  "/dashboard/storefront/marketing",
  "/dashboard/storefront/reviews",
  "/dashboard/storefront/referrals",
  "/dashboard/storefront/schedule",
  "/dashboard/storefront/inventory",
  "/dashboard/storefront/seo",
  "/dashboard/storefront/analytics",
  "/dashboard/storefront/notifications",
  "/dashboard/storefront/settings",
  "/dashboard/storefront/advanced",
  "/dashboard/storefront/preview",
] as const;

export type StorefrontRevalidateScope = "all" | "catalog" | "theme" | "settings";

export type StorefrontRevalidateOpts = {
  storefrontId?: string;
  ownerUserId?: string;
  skipCdn?: boolean;
};

async function revalidateCatalogTagsForStore(storeSlug: string, ownerUserId: string) {
  const markets = await loadMarketsForStorefrontOwner(ownerUserId);
  const marketIds = markets.map((m) => m.id);
  for (const tag of allStorefrontCatalogTags(storeSlug, marketIds)) {
    revalidateTag(tag);
  }
}

/**
 * After storefront mutations: revalidate admin paths, public layout, and tagged ISR caches.
 */
export function revalidateStorefrontDashboardAndPublic(
  storeSlug: string,
  scope: StorefrontRevalidateScope = "all",
  opts?: StorefrontRevalidateOpts,
) {
  for (const p of STATIC_STOREFRONT_ADMIN) {
    revalidatePath(p);
  }
  revalidatePath("/s/" + storeSlug);

  const cdnScope: StorefrontCdnPurgeScope =
    scope === "catalog" ? "catalog" : scope === "theme" ? "theme" : scope === "settings" ? "settings" : "all";

  if (scope === "catalog") {
    revalidateTag(storefrontCatalogTag(storeSlug));
    if (opts?.ownerUserId) {
      void revalidateCatalogTagsForStore(storeSlug, opts.ownerUserId);
    }
  } else if (scope === "theme") {
    revalidateTag(storefrontThemeTag(storeSlug));
  } else if (scope === "settings") {
    revalidateTag(storefrontSettingsTag(storeSlug));
  } else {
    for (const t of allStorefrontTags(storeSlug)) {
      revalidateTag(t);
    }
    if (opts?.ownerUserId) {
      void revalidateCatalogTagsForStore(storeSlug, opts.ownerUserId);
    }
  }

  if (!opts?.skipCdn && opts?.storefrontId) {
    void purgeStorefrontCdnByScope({
      storefrontId: opts.storefrontId,
      storeSlug,
      scope: cdnScope,
      ownerUserId: opts.ownerUserId,
    });
  }
}

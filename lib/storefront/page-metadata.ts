import type { Metadata } from "next";

import { loadPublicStorefrontPage } from "@/lib/storefront/public-storefront-brand";
import { buildStorefrontMetadata } from "@/lib/storefront/seo";

/** Shared metadata for commerce sub-routes (/menu, /cart, /checkout) with brand canonical. */
export async function buildStorefrontCommerceMetadata(
  storeSlug: string,
  segment: "menu" | "cart" | "checkout",
  ownerUserId?: string | null,
): Promise<Metadata> {
  const bundle = await loadPublicStorefrontPage(storeSlug, ownerUserId ?? null);
  if (!bundle) return { title: "Store" };

  const titles: Record<typeof segment, string> = {
    menu: "Menu",
    cart: "Cart",
    checkout: "Checkout",
  };

  const { sf, canonicalBase, brandOverlay } = bundle;
  return buildStorefrontMetadata(sf, storeSlug, {
    title: `${titles[segment]} — ${brandOverlay?.seoTitle ?? sf.publicName}`,
    path: `/${segment}`,
    canonicalBase,
    brand: brandOverlay,
  });
}

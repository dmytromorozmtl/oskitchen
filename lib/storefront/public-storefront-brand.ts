import {
  applyBrandContextToStorefront,
  brandSeoOverlay,
  storefrontCanonicalBaseForBrand,
  type BrandSeoOverlay,
} from "@/lib/storefront/load-brand-for-storefront";
import { readStorefrontBrandContext } from "@/lib/storefront/brand-cookie-server";
import {
  getStorefrontForPublicFromRequest,
  type StorefrontPublicPayload,
} from "@/lib/storefront/public-access";

export type PublicStorefrontBrandBundle = {
  sf: StorefrontPublicPayload;
  brandId: string | null;
  brandOverlay: BrandSeoOverlay | null;
  canonicalBase: string;
};

/** Merge kos_brand cookie/header theme + SEO without re-querying host on every RSC. */
export async function resolvePublicStorefrontWithBrand(
  sf: StorefrontPublicPayload,
  storeSlug: string,
): Promise<PublicStorefrontBrandBundle> {
  const ctx = await readStorefrontBrandContext();
  const { sf: merged, brand, brandId } = await applyBrandContextToStorefront(sf, {
    brandId: ctx?.brandId ?? null,
    brandSlug: ctx?.brandSlug ?? null,
  });
  const brandOverlay = brand ? brandSeoOverlay(brand) : null;
  const canonicalBase = storefrontCanonicalBaseForBrand(merged, storeSlug, brandOverlay);
  return { sf: merged, brandId, brandOverlay, canonicalBase };
}

/** Load published storefront + brand overlay for public pages (PDP, collections, CMS). */
export async function loadPublicStorefrontPage(
  storeSlug: string,
  ownerUserId?: string | null,
): Promise<PublicStorefrontBrandBundle | null> {
  const sfRaw = await getStorefrontForPublicFromRequest(storeSlug, ownerUserId ?? null);
  if (!sfRaw) return null;
  return resolvePublicStorefrontWithBrand(sfRaw, storeSlug);
}

import type { Brand, StorefrontSettings } from "@prisma/client";

export type BrandThemeTokens = {
  brandColor?: string | null;
  secondaryColor?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  coverImageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export type StorefrontThemeSource = Pick<
  StorefrontSettings,
  | "brandColor"
  | "secondaryColor"
  | "logoUrl"
  | "faviconUrl"
  | "coverImageUrl"
  | "seoTitle"
  | "seoDescription"
  | "heroImageUrl"
>;

/**
 * Merge linked Brand tokens into storefront settings for public rendering.
 * Storefront-specific values win when set (non-empty).
 */
export function mergeBrandThemeIntoStorefront<T extends StorefrontThemeSource>(
  sf: T,
  brand: Pick<
    Brand,
    | "brandColor"
    | "secondaryColor"
    | "logoUrl"
    | "faviconUrl"
    | "coverImageUrl"
    | "seoTitle"
    | "seoDescription"
  > | null,
): T {
  if (!brand) return sf;

  const pick = <V extends string | null | undefined>(store: V, brandVal: V) => {
    const s = typeof store === "string" ? store.trim() : store;
    if (s) return store;
    const b = typeof brandVal === "string" ? brandVal.trim() : brandVal;
    return b || store;
  };

  return {
    ...sf,
    brandColor: pick(sf.brandColor, brand.brandColor),
    secondaryColor: pick(sf.secondaryColor, brand.secondaryColor),
    logoUrl: pick(sf.logoUrl, brand.logoUrl),
    faviconUrl: pick(sf.faviconUrl, brand.faviconUrl),
    coverImageUrl: pick(sf.coverImageUrl ?? sf.heroImageUrl, brand.coverImageUrl),
    seoTitle: pick(sf.seoTitle, brand.seoTitle),
    seoDescription: pick(sf.seoDescription, brand.seoDescription),
  };
}

/** Resolve storefront by brand default slug routing (enterprise multi-brand). */
export async function resolveStorefrontSlugForBrand(
  brand: { slug: string; defaultStorefrontId: string | null },
  storefronts: { id: string; storeSlug: string; brandId: string | null }[],
): Promise<string | null> {
  if (brand.defaultStorefrontId) {
    const linked = storefronts.find((s) => s.id === brand.defaultStorefrontId);
    if (linked) return linked.storeSlug;
  }
  const byBrand = storefronts.find((s) => s.brandId);
  return byBrand?.storeSlug ?? null;
}

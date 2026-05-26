import { prisma } from "@/lib/prisma";
import { mergeBrandThemeIntoStorefront, type StorefrontThemeSource } from "@/lib/storefront/brand-theme";
import type { StorefrontPublicPayload } from "@/lib/storefront/public-access";
import { storefrontCanonicalBase } from "@/lib/storefront/seo";

const brandSelect = {
  id: true,
  slug: true,
  brandColor: true,
  secondaryColor: true,
  logoUrl: true,
  faviconUrl: true,
  coverImageUrl: true,
  seoTitle: true,
  seoDescription: true,
  seoImageUrl: true,
  brandCustomDomain: true,
} as const;

export type BrandSeoOverlay = {
  seoTitle: string | null;
  seoDescription: string | null;
  seoImageUrl: string | null;
  brandCustomDomain: string | null;
  brandSlug: string;
};

export async function loadBrandById(brandId: string) {
  return prisma.brand.findUnique({
    where: { id: brandId, lifecycleStatus: "ACTIVE" },
    select: brandSelect,
  });
}

/** Apply brand theme from cookie/header or linked brandId on storefront row. */
export async function applyBrandContextToStorefront<T extends StorefrontPublicPayload>(
  sf: T,
  opts: { brandId?: string | null; brandSlug?: string | null },
): Promise<{ sf: T; brand: Awaited<ReturnType<typeof loadBrandById>>; brandId: string | null }> {
  let brandId = opts.brandId ?? sf.brandId ?? null;

  if (!brandId && opts.brandSlug && sf.workspaceId) {
    const bySlug = await prisma.brand.findFirst({
      where: {
        workspaceId: sf.workspaceId,
        slug: { equals: opts.brandSlug, mode: "insensitive" },
        lifecycleStatus: "ACTIVE",
      },
      select: { id: true },
    });
    brandId = bySlug?.id ?? null;
  }

  if (!brandId) {
    return { sf, brand: null, brandId: null };
  }

  const brand = await loadBrandById(brandId);
  if (!brand) {
    return { sf, brand: null, brandId: null };
  }

  const merged = mergeBrandThemeIntoStorefront(sf, brand) as T;
  if (!merged.heroImageUrl && brand.seoImageUrl) {
    (merged as StorefrontThemeSource).heroImageUrl = brand.seoImageUrl;
  }

  return { sf: merged, brand, brandId: brand.id };
}

export function brandSeoOverlay(brand: NonNullable<Awaited<ReturnType<typeof loadBrandById>>>): BrandSeoOverlay {
  return {
    seoTitle: brand.seoTitle,
    seoDescription: brand.seoDescription,
    seoImageUrl: brand.seoImageUrl,
    brandCustomDomain: brand.brandCustomDomain,
    brandSlug: brand.slug,
  };
}

export function storefrontCanonicalBaseForBrand(
  sf: StorefrontPublicPayload,
  storeSlug: string,
  brand: BrandSeoOverlay | null,
): string {
  const custom = brand?.brandCustomDomain?.trim();
  if (custom) {
    return `https://${custom.replace(/^https?:\/\//i, "").split("/")[0]}`;
  }
  return storefrontCanonicalBase(sf, storeSlug);
}

import { prisma } from "@/lib/prisma";

export type BrandHostResolution = {
  storeSlug: string;
  brandId: string;
  brandSlug: string;
};

/**
 * Composite vanity host: `{brandSlug}.{storeSlug}.{root}` → brand-linked storefront.
 * Example: weekend.hello.kitchenos.com
 */
export function parseBrandStoreCompositeHost(
  hostLabel: string,
  rootDomain: string,
): { brandSlug: string; storeSlug: string } | null {
  const root = rootDomain.toLowerCase().replace(/^www\./, "");
  const label = hostLabel.trim().toLowerCase();
  const suffix = `.${root}`;
  if (!label.endsWith(suffix)) return null;
  const sub = label.slice(0, -suffix.length);
  const parts = sub.split(".").filter(Boolean);
  if (parts.length !== 2) return null;
  const [brandSlug, storeSlug] = parts;
  if (!/^[a-z0-9-]{2,80}$/.test(brandSlug) || !/^[a-z0-9-]{2,120}$/.test(storeSlug)) return null;
  return { brandSlug, storeSlug };
}

/** Resolve brand by custom domain or slug within a published storefront workspace. */
export async function resolveBrandHost(
  host: string,
  rootDomain?: string | null,
): Promise<BrandHostResolution | null> {
  const normalized = host.split(":")[0]?.trim().toLowerCase();
  if (!normalized) return null;

  if (rootDomain) {
    const composite = parseBrandStoreCompositeHost(normalized, rootDomain);
    if (composite) {
      const sf = await prisma.storefrontSettings.findFirst({
        where: {
          storeSlug: composite.storeSlug,
          enabled: true,
          published: true,
          workspaceId: { not: null },
        },
        select: { id: true, workspaceId: true, storeSlug: true },
      });
      if (!sf?.workspaceId) return null;

      const brand = await prisma.brand.findFirst({
        where: {
          workspaceId: sf.workspaceId,
          slug: { equals: composite.brandSlug, mode: "insensitive" },
          lifecycleStatus: "ACTIVE",
        },
        select: { id: true, slug: true, defaultStorefrontId: true },
      });
      if (!brand) return null;

      const linked = await prisma.storefrontSettings.findFirst({
        where: {
          enabled: true,
          published: true,
          OR: [
            { id: brand.defaultStorefrontId ?? "" },
            { brandId: brand.id, workspaceId: sf.workspaceId },
          ],
        },
        select: { storeSlug: true },
        orderBy: { updatedAt: "desc" },
      });

      return {
        storeSlug: linked?.storeSlug ?? sf.storeSlug,
        brandId: brand.id,
        brandSlug: brand.slug,
      };
    }
  }

  const byDomain = await prisma.brand.findFirst({
    where: {
      brandCustomDomain: { equals: normalized, mode: "insensitive" },
      lifecycleStatus: "ACTIVE",
    },
    select: {
      id: true,
      slug: true,
      workspaceId: true,
      defaultStorefrontId: true,
    },
  });
  if (!byDomain) return null;

  const storefront = await prisma.storefrontSettings.findFirst({
    where: {
      enabled: true,
      published: true,
      OR: [
        { id: byDomain.defaultStorefrontId ?? "" },
        { brandId: byDomain.id, workspaceId: byDomain.workspaceId },
        { workspaceId: byDomain.workspaceId },
      ],
    },
    select: { storeSlug: true },
    orderBy: [{ brandId: "desc" }, { isPrimary: "desc" }, { updatedAt: "desc" }],
  });

  if (!storefront) return null;

  return {
    storeSlug: storefront.storeSlug,
    brandId: byDomain.id,
    brandSlug: byDomain.slug,
  };
}

/** Path-based brand entry: /b/{brandSlug} on apex → default storefront slug. */
export async function resolveBrandPathSlug(brandSlug: string): Promise<BrandHostResolution | null> {
  const slug = brandSlug.trim().toLowerCase();
  if (!/^[a-z0-9-]{2,80}$/.test(slug)) return null;

  const brand = await prisma.brand.findFirst({
    where: { slug: { equals: slug, mode: "insensitive" }, lifecycleStatus: "ACTIVE" },
    select: { id: true, slug: true, workspaceId: true, defaultStorefrontId: true },
  });
  if (!brand) return null;

  const storefront = await prisma.storefrontSettings.findFirst({
    where: {
      enabled: true,
      published: true,
      OR: [
        { id: brand.defaultStorefrontId ?? "" },
        { brandId: brand.id, workspaceId: brand.workspaceId },
        { workspaceId: brand.workspaceId },
      ],
    },
    select: { storeSlug: true },
    orderBy: [{ brandId: "desc" }, { isPrimary: "desc" }],
  });
  if (!storefront) return null;

  return { storeSlug: storefront.storeSlug, brandId: brand.id, brandSlug: brand.slug };
}

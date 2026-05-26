import { prisma } from "@/lib/prisma";
import { productUrlSegment } from "@/lib/storefront/resolve-product-ref";
import type { StorefrontPublicPayload } from "@/lib/storefront/public-access";

/** Google allows 50k URLs per sitemap file; use 45k for headroom. */
export const SITEMAP_MAX_URLS_PER_FILE = 45_000;

const STATIC_PATHS = [
  "",
  "/menu",
  "/about",
  "/contact",
  "/faq",
  "/catering",
  "/cart",
  "/checkout",
  "/policies/privacy",
  "/policies/terms",
] as const;

export async function collectStorefrontSitemapPaths(
  sf: StorefrontPublicPayload,
): Promise<string[]> {
  const productPaths =
    sf.activeMenu?.products.map((p) =>
      `/products/${encodeURIComponent(productUrlSegment({ id: p.id, publicSlug: p.publicSlug }))}`,
    ) ?? [];

  const customPages = await prisma.storefrontPage.findMany({
    where: { storefrontId: sf.id, published: true, pageType: "CUSTOM" },
    select: { slug: true },
    orderBy: { sortOrder: "asc" },
  });
  const customPagePaths = customPages.map((p) => `/p/${encodeURIComponent(p.slug)}`);

  const collections = await prisma.menu.findMany({
    where: { userId: sf.userId, collectionSlug: { not: null }, catalogOnly: false },
    select: { collectionSlug: true },
  });
  const collectionPaths = collections
    .map((m) => m.collectionSlug)
    .filter((s): s is string => Boolean(s?.trim()))
    .map((s) => `/collections/${encodeURIComponent(s)}`);

  return [...STATIC_PATHS, ...productPaths, ...customPagePaths, ...collectionPaths];
}

export function chunkSitemapPaths(paths: string[], chunkSize = SITEMAP_MAX_URLS_PER_FILE): string[][] {
  if (paths.length === 0) return [[]];
  const chunks: string[][] = [];
  for (let i = 0; i < paths.length; i += chunkSize) {
    chunks.push(paths.slice(i, i + chunkSize));
  }
  return chunks;
}

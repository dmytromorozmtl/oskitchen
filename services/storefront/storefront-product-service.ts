import { prisma } from "@/lib/prisma";
import type { StorefrontCatalogProduct } from "@/lib/storefront/catalog-types";
import { buildStorefrontMenuCatalog } from "@/services/storefront/storefront-menu-catalog-service";

export type StorefrontPublicProduct = {
  id: string;
  publicSlug: string | null;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
};

function catalogToPublic(products: StorefrontCatalogProduct[]): StorefrontPublicProduct[] {
  return products.map((p) => ({
    id: p.id,
    publicSlug: p.publicSlug,
    title: p.title,
    description: p.description,
    price: p.price,
    imageUrl: p.image,
  }));
}

/** Featured products for public product grid (active menu, storefront-visible). */
export async function getStorefrontProducts(
  storefrontId: string,
  opts?: { take?: number; menuId?: string | null },
): Promise<StorefrontPublicProduct[]> {
  const take = opts?.take ?? 6;
  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: storefrontId },
    select: {
      storeSlug: true,
      currency: true,
      activeMenuId: true,
      activeMenu: {
        select: {
          id: true,
          products: {
            where: { active: true, storefrontVisible: true },
            orderBy: { sortOrder: "asc" },
            take,
            select: {
              id: true,
              publicSlug: true,
              title: true,
              description: true,
              price: true,
              image: true,
            },
          },
        },
      },
    },
  });
  if (!sf) return [];

  const menuId = opts?.menuId?.trim() || sf.activeMenuId;
  if (!menuId) return [];

  const fromMenu = sf.activeMenu?.products ?? [];
  if (fromMenu.length > 0 && menuId === sf.activeMenuId) {
    return fromMenu.map((p) => ({
      id: p.id,
      publicSlug: p.publicSlug,
      title: p.title,
      description: p.description,
      price: Number(p.price),
      imageUrl: p.image,
    }));
  }

  const catalog = await buildStorefrontMenuCatalog({
    storefrontId,
    storeSlug: sf.storeSlug,
    menuId,
    currency: sf.currency,
    marketId: null,
    marketProductIds: null,
  });
  if (!catalog?.products.length) return [];
  return catalogToPublic(catalog.products.slice(0, take));
}

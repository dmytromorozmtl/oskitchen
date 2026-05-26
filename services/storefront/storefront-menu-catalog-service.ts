import { prisma } from "@/lib/prisma";
import type { StorefrontCatalogProduct, StorefrontMenuCatalog } from "@/lib/storefront/catalog-types";
import { computeMenuPriceVersion } from "@/lib/storefront/menu-price-version";
import { getMenuAvailabilityMap } from "@/services/storefront/storefront-menu-availability-service";
import {
  loadVariantAndModifierMaps,
  resolveVariantUnitPrice,
} from "@/services/storefront/storefront-variant-catalog-loader";

export async function buildStorefrontMenuCatalog(input: {
  storefrontId: string;
  storeSlug: string;
  menuId: string;
  currency: string;
  /** When set, only include these product IDs (market routing). */
  marketProductIds?: string[] | null;
  marketId?: string | null;
}): Promise<StorefrontMenuCatalog | null> {
  const menu = await prisma.menu.findFirst({
    where: { id: input.menuId },
    include: {
      products: {
        where: { active: true, storefrontVisible: true },
        orderBy: { preparedDate: "asc" },
      },
    },
  });
  if (!menu) return null;

  let activeProducts = menu.products;
  if (input.marketProductIds?.length) {
    const allowed = new Set(input.marketProductIds);
    activeProducts = activeProducts.filter((p) => allowed.has(p.id));
  }
  if (activeProducts.length === 0) return null;

  const productIds = activeProducts.map((p) => p.id);
  const [availability, { variantsByProduct, modifiersByProduct }] = await Promise.all([
    getMenuAvailabilityMap(menu.id, productIds),
    loadVariantAndModifierMaps({ storefrontId: input.storefrontId, productIds }),
  ]);

  const variantRows = await prisma.storefrontProductVariant.findMany({
    where: { storefrontId: input.storefrontId, productId: { in: productIds }, active: true },
  });
  const variantPriceMap = new Map(
    variantRows.map((v) => [v.id, resolveVariantUnitPrice(Number(menu.products.find((p) => p.id === v.productId)?.price ?? 0), v)]),
  );

  const products: StorefrontCatalogProduct[] = activeProducts.map((p) => {
    const price = Number(p.price);
    const maxSf = p.maxStorefrontQuantity ?? null;
    const avail = availability.get(p.id);
    const soldOut = avail?.soldOut === true;
    let availableQty = avail?.availableQty ?? null;
    if (maxSf != null) {
      availableQty = availableQty != null ? Math.min(availableQty, maxSf) : maxSf;
    }
    const canAddToCart = !soldOut && (availableQty == null || availableQty > 0);

    const rawVariants = variantsByProduct.get(p.id) ?? [];
    const variants = rawVariants.map((v) => ({
      ...v,
      price: variantPriceMap.get(v.id) ?? price,
      canAddToCart: v.canAddToCart && canAddToCart,
    }));

    return {
      id: p.id,
      publicSlug: p.publicSlug,
      title: p.title,
      description: p.description,
      price,
      preparedDate: p.preparedDate.toISOString(),
      image: p.image,
      maxStorefrontQuantity: maxSf,
      soldOut,
      availableQty,
      canAddToCart,
      variants,
      modifierGroups: modifiersByProduct.get(p.id) ?? [],
      allergens: p.allergens ?? null,
    };
  });

  return {
    storefrontId: input.storefrontId,
    storeSlug: input.storeSlug,
    menuId: menu.id,
    currency: input.currency,
    marketId: input.marketId ?? null,
    priceVersion: computeMenuPriceVersion(products),
    products,
  };
}

export async function loadPublishedStorefrontCatalog(
  storeSlug: string,
): Promise<StorefrontMenuCatalog | null> {
  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug, enabled: true, published: true },
    select: {
      id: true,
      storeSlug: true,
      activeMenuId: true,
      currency: true,
      activeMenu: { select: { id: true, catalogOnly: true } },
    },
  });
  if (!sf?.activeMenuId || !sf.activeMenu || sf.activeMenu.catalogOnly) return null;

  return buildStorefrontMenuCatalog({
    storefrontId: sf.id,
    storeSlug: sf.storeSlug,
    menuId: sf.activeMenuId,
    currency: sf.currency,
  });
}

export { loadPublishedStorefrontCatalog as default };

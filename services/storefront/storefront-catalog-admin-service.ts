import { prisma } from "@/lib/prisma";
import { getPrimaryOwnerStorefront } from "@/lib/storefront/resolve-owner-storefront";

export async function getStorefrontCatalogAdminContext(userId: string) {
  const primary = await getPrimaryOwnerStorefront(userId);
  if (!primary) return null;

  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: primary.id },
    include: {
      activeMenu: {
        include: {
          products: {
            where: { active: true },
            orderBy: { title: "asc" },
            select: { id: true, title: true, price: true },
          },
        },
      },
    },
  });
  if (!sf) return null;

  const productIds = sf.activeMenu?.products.map((p) => p.id) ?? [];
  const [variants, modifierGroups, availabilities] = await Promise.all([
    prisma.storefrontProductVariant.findMany({
      where: { storefrontId: sf.id, productId: { in: productIds } },
      orderBy: [{ productId: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.storefrontModifierGroup.findMany({
      where: { storefrontId: sf.id },
      include: { options: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
    sf.activeMenuId
      ? prisma.productAvailability.findMany({
          where: { menuId: sf.activeMenuId },
          orderBy: { productId: "asc" },
        })
      : Promise.resolve([]),
  ]);

  return {
    products: sf.activeMenu?.products ?? [],
    variants,
    modifierGroups,
    availabilities,
  };
}

export async function assertProductOnStorefront(storefrontId: string, productId: string) {
  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: storefrontId },
    select: { activeMenuId: true },
  });
  if (!sf?.activeMenuId) throw new Error("Storefront has no active menu.");
  const product = await prisma.product.findFirst({
    where: { id: productId, menuId: sf.activeMenuId, active: true },
    select: { id: true },
  });
  if (!product) throw new Error("Product is not on this storefront menu.");
}

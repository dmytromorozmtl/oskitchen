import { prisma } from "@/lib/prisma";

export async function getUpsellsForCart(input: {
  storefrontId: string;
  productIds: string[];
}) {
  if (input.productIds.length === 0) return [];
  const rules = await prisma.storefrontUpsellRule.findMany({
    where: {
      storefrontId: input.storefrontId,
      active: true,
      triggerProductId: { in: input.productIds },
      displayType: "CART",
    },
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    take: 20,
  });
  const suggestIds = [...new Set(rules.flatMap((r) => r.suggestProductIds))].slice(0, 12);
  if (suggestIds.length === 0) return [];
  const products = await prisma.product.findMany({
    where: { id: { in: suggestIds }, storefrontVisible: true, active: true },
    select: { id: true, title: true, price: true, publicSlug: true, image: true },
  });
  return products.map((p) => ({
    id: p.id,
    title: p.title,
    price: Number(p.price),
    publicSlug: p.publicSlug,
    image: p.image,
  }));
}

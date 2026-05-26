import { prisma } from "@/lib/prisma";

export type MenuEngineeringCategory = "STAR" | "PLOW" | "PUZZLE" | "DOG";

export async function getMenuEngineeringMatrix(userId: string) {
  const since = new Date(Date.now() - 90 * 86_400_000);

  const products = await prisma.product.findMany({
    where: { menu: { userId }, active: true },
    select: {
      id: true,
      title: true,
      price: true,
      orderItems: {
        where: { order: { createdAt: { gte: since }, status: { not: "CANCELLED" } } },
        select: { id: true },
      },
      costSnapshots: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { totalCost: true },
      },
    },
  });

  const avgPopularity =
    products.reduce((s, p) => s + p.orderItems.length, 0) / Math.max(products.length, 1);
  const targetMargin = 65;

  return products.map((p) => {
    const popularity = p.orderItems.length;
    const cost = p.costSnapshots[0] ? Number(p.costSnapshots[0].totalCost) : 0;
    const price = Number(p.price);
    const profitability = price > 0 ? ((price - cost) / price) * 100 : 0;

    let category: MenuEngineeringCategory;
    if (popularity >= avgPopularity && profitability >= targetMargin) category = "STAR";
    else if (popularity >= avgPopularity && profitability < targetMargin) category = "PLOW";
    else if (popularity < avgPopularity && profitability >= targetMargin) category = "PUZZLE";
    else category = "DOG";

    return {
      productId: p.id,
      productName: p.title,
      popularity,
      profitability: Math.round(profitability * 10) / 10,
      category,
      price,
      cost,
    };
  });
}

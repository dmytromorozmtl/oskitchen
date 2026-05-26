import { prisma } from "@/lib/prisma";

export type ProductAvailabilityState = {
  soldOut: boolean;
  maxQuantity: number | null;
  soldQuantity: number;
  availableQty: number | null;
};

/**
 * Kitchen availability for the active menu window (from menu planner / product_availabilities).
 */
export async function getMenuAvailabilityMap(
  menuId: string,
  productIds: string[],
): Promise<Map<string, ProductAvailabilityState>> {
  const out = new Map<string, ProductAvailabilityState>();
  if (productIds.length === 0) return out;

  const now = new Date();
  const rows = await prisma.productAvailability.findMany({
    where: {
      menuId,
      productId: { in: productIds },
      availableFrom: { lte: now },
      availableUntil: { gte: now },
    },
    select: {
      productId: true,
      soldOut: true,
      maxQuantity: true,
      soldQuantity: true,
    },
  });

  for (const pid of productIds) {
    const matches = rows.filter((r) => r.productId === pid);
    if (matches.length === 0) {
      out.set(pid, {
        soldOut: false,
        maxQuantity: null,
        soldQuantity: 0,
        availableQty: null,
      });
      continue;
    }

    const soldOut = matches.some((m) => m.soldOut);
    const maxQ = matches.reduce<number | null>((acc, m) => {
      if (m.maxQuantity == null) return acc;
      if (acc == null) return m.maxQuantity;
      return Math.max(acc, m.maxQuantity);
    }, null);
    const sold = matches.reduce((s, m) => s + m.soldQuantity, 0);
    const availableQty =
      maxQ != null ? Math.max(0, maxQ - sold) : null;

    out.set(pid, {
      soldOut: soldOut || (availableQty !== null && availableQty <= 0),
      maxQuantity: maxQ,
      soldQuantity: sold,
      availableQty,
    });
  }

  return out;
}

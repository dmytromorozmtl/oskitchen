import { prisma } from "@/lib/prisma";

export async function listSupplierItemsForBulkEdit(
  userId: string,
  filters?: { supplierId?: string; category?: string },
) {
  return prisma.supplierItem.findMany({
    where: {
      supplier: { userId, ...(filters?.supplierId ? { id: filters.supplierId } : {}) },
      active: true,
      ...(filters?.category
        ? { ingredient: { category: filters.category } }
        : {}),
    },
    include: {
      supplier: { select: { name: true } },
      ingredient: { select: { name: true, category: true } },
    },
    orderBy: [{ supplier: { name: "asc" } }, { ingredient: { name: "asc" } }],
    take: 200,
  });
}

export async function bulkUpdateSupplierPrices(
  userId: string,
  updates: Array<{ supplierItemId: string; unitCost: number }>,
  performedByLabel = "bulk_price_editor",
) {
  for (const u of updates) {
    const item = await prisma.supplierItem.findFirst({
      where: { id: u.supplierItemId, supplier: { userId } },
    });
    if (!item) continue;

    const oldCost = Number(item.unitCost);
    await prisma.$transaction([
      prisma.supplierItem.update({
        where: { id: item.id },
        data: { unitCost: u.unitCost, lastUpdatedAt: new Date() },
      }),
      prisma.supplierPriceHistory.create({
        data: {
          supplierItemId: item.id,
          ingredientId: item.ingredientId,
          oldUnitCost: oldCost,
          newUnitCost: u.unitCost,
          source: performedByLabel,
        },
      }),
    ]);
  }
}

export async function listBulkPriceAuditLog(userId: string, limit = 30) {
  return prisma.supplierPriceHistory.findMany({
    where: { supplierItem: { supplier: { userId } }, source: "bulk_price_editor" },
    orderBy: { effectiveAt: "desc" },
    take: limit,
    include: {
      supplierItem: {
        include: {
          supplier: { select: { name: true } },
          ingredient: { select: { name: true } },
        },
      },
    },
  });
}

export async function undoLastBulkPriceChange(userId: string) {
  const latest = await prisma.supplierPriceHistory.findFirst({
    where: { supplierItem: { supplier: { userId } }, source: "bulk_price_editor" },
    orderBy: { effectiveAt: "desc" },
  });
  if (!latest) return { undone: 0 };

  const windowStart = new Date(latest.effectiveAt.getTime() - 3000);
  const batch = await prisma.supplierPriceHistory.findMany({
    where: {
      supplierItem: { supplier: { userId } },
      source: "bulk_price_editor",
      effectiveAt: { gte: windowStart, lte: latest.effectiveAt },
    },
  });

  let undone = 0;
  for (const h of batch) {
    if (!h.supplierItemId || h.oldUnitCost == null) continue;
    await prisma.supplierItem.update({
      where: { id: h.supplierItemId },
      data: { unitCost: h.oldUnitCost },
    });
    undone += 1;
  }

  return { undone };
}

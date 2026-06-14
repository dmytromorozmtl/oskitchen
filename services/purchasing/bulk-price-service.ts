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
  if (updates.length === 0) return;

  const itemIds = updates.map((u) => u.supplierItemId);
  const items = await prisma.supplierItem.findMany({
    where: { id: { in: itemIds }, supplier: { userId } },
  });
  const itemById = new Map(items.map((item) => [item.id, item]));

  const ops = [];
  for (const update of updates) {
    const item = itemById.get(update.supplierItemId);
    if (!item) continue;

    const oldCost = Number(item.unitCost);
    ops.push(
      prisma.supplierItem.update({
        where: { id: item.id },
        data: { unitCost: update.unitCost, lastUpdatedAt: new Date() },
      }),
      prisma.supplierPriceHistory.create({
        data: {
          supplierItemId: item.id,
          ingredientId: item.ingredientId,
          oldUnitCost: oldCost,
          newUnitCost: update.unitCost,
          source: performedByLabel,
        },
      }),
    );
  }

  if (ops.length > 0) {
    await prisma.$transaction(ops);
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

import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  ingredientListWhereForOwner,
  inventoryCountByIdWhereForOwner,
  inventoryCountListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

export type CountStockAdjustment = {
  ingredientId: string;
  expectedQty: number;
  countedQty: number;
};

export type InventoryCountVarianceSummary = {
  lineCount: number;
  linesCounted: number;
  linesUncounted: number;
  linesWithVariance: number;
  totalVarianceQty: number;
  totalVarianceCost: number;
  shrinkCost: number;
  overageCost: number;
};

/** Roll up count-line variance for operator dashboards (pure, testable). */
export function summarizeInventoryCountVariance(
  items: Array<{
    countedQty: unknown;
    varianceQty: unknown;
    varianceCost: unknown;
  }>,
): InventoryCountVarianceSummary {
  let linesCounted = 0;
  let linesWithVariance = 0;
  let totalVarianceQty = 0;
  let totalVarianceCost = 0;
  let shrinkCost = 0;
  let overageCost = 0;

  for (const item of items) {
    if (item.countedQty === null || item.countedQty === undefined) continue;
    linesCounted += 1;

    const varianceQty = item.varianceQty != null ? Number(item.varianceQty) : 0;
    const varianceCost = item.varianceCost != null ? Number(item.varianceCost) : 0;

    if (varianceQty !== 0) linesWithVariance += 1;
    totalVarianceQty += varianceQty;
    totalVarianceCost += varianceCost;
    if (varianceCost < 0) shrinkCost += varianceCost;
    else if (varianceCost > 0) overageCost += varianceCost;
  }

  return {
    lineCount: items.length,
    linesCounted,
    linesUncounted: items.length - linesCounted,
    linesWithVariance,
    totalVarianceQty,
    totalVarianceCost,
    shrinkCost,
    overageCost,
  };
}

export async function listInventoryCounts(userId: string, take = 30) {
  return prisma.inventoryCount.findMany({
    where: await inventoryCountListWhereForOwner(userId),
    orderBy: { createdAt: "desc" },
    take,
    include: { _count: { select: { items: true } } },
  });
}

export async function getInventoryCountDetail(countId: string, userId: string) {
  return prisma.inventoryCount.findFirst({
    where: await inventoryCountByIdWhereForOwner(userId, countId),
    include: {
      items: {
        include: { ingredient: { select: { id: true, name: true } } },
        orderBy: { ingredient: { name: "asc" } },
      },
    },
  });
}

export async function startInventoryCount(userId: string, countedById: string, locationId?: string) {
  const ingredients = await prisma.ingredient.findMany({
    where: { AND: [await ingredientListWhereForOwner(userId), { active: true }] },
    select: { id: true, unit: true, currentStock: true, costPerUnit: true },
  });

  const workspaceId = await resolveOwnerWorkspaceId(userId);
  return prisma.inventoryCount.create({
    data: {
      userId,
      workspaceId,
      locationId: locationId ?? null,
      countedById,
      items: {
        create: ingredients.map((ing) => ({
          ingredientId: ing.id,
          unit: ing.unit,
          expectedQty: Number(ing.currentStock),
        })),
      },
    },
    include: { items: true },
  });
}

export async function submitCountItem(
  countItemId: string,
  userId: string,
  countedQty: number,
  notes?: string,
) {
  const countScope = await inventoryCountListWhereForOwner(userId);
  const item = await prisma.inventoryCountItem.findFirst({
    where: { id: countItemId, inventoryCount: countScope },
    include: {
      ingredient: { select: { costPerUnit: true } },
      inventoryCount: true,
    },
  });
  if (!item) throw new Error("Item not found");

  const varianceQty = countedQty - Number(item.expectedQty);
  const varianceCost = varianceQty * Number(item.ingredient.costPerUnit);

  return prisma.inventoryCountItem.update({
    where: { id: countItemId },
    data: {
      countedQty,
      varianceQty,
      varianceCost,
      notes: notes ?? null,
    },
  });
}

export function buildCountStockAdjustments(
  items: Array<{ ingredientId: string; expectedQty: unknown; countedQty: unknown }>,
): CountStockAdjustment[] {
  const adjustments: CountStockAdjustment[] = [];
  for (const item of items) {
    if (item.countedQty === null || item.countedQty === undefined) continue;
    adjustments.push({
      ingredientId: item.ingredientId,
      expectedQty: Number(item.expectedQty),
      countedQty: Number(item.countedQty),
    });
  }
  return adjustments;
}

export async function completeInventoryCount(countId: string, userId: string) {
  const count = await prisma.inventoryCount.findFirst({
    where: await inventoryCountByIdWhereForOwner(userId, countId),
    include: {
      items: {
        select: {
          ingredientId: true,
          expectedQty: true,
          countedQty: true,
        },
      },
    },
  });
  if (!count) throw new Error("Count not found");
  if (count.status !== "IN_PROGRESS") throw new Error("Count already completed");

  const adjustments = buildCountStockAdjustments(count.items);
  const varianceSummary = summarizeInventoryCountVariance(count.items);
  const ingredientScope = await ingredientListWhereForOwner(userId);

  await prisma.$transaction(async (tx) => {
    for (const adj of adjustments) {
      await tx.ingredient.updateMany({
        where: { AND: [ingredientScope, { id: adj.ingredientId }] },
        data: { currentStock: adj.countedQty },
      });
    }
    await tx.inventoryCount.update({
      where: { id: countId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  });

  await recordAuditLog({
    userId,
    workspaceId: count.workspaceId,
    action: "inventory.count_completed",
    entityType: "InventoryCount",
    entityId: countId,
    metadata: {
      adjustmentCount: adjustments.length,
      adjustments: adjustments.slice(0, 100),
      varianceSummary,
    },
  });

  return prisma.inventoryCount.findFirst({
    where: await inventoryCountByIdWhereForOwner(userId, countId),
  });
}

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  ingredientListWhereForOwner,
  inventoryCountByIdWhereForOwner,
  inventoryCountListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

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

export async function completeInventoryCount(countId: string, userId: string) {
  const count = await prisma.inventoryCount.findFirst({
    where: await inventoryCountByIdWhereForOwner(userId, countId),
  });
  if (!count) throw new Error("Count not found");

  return prisma.inventoryCount.update({
    where: { id: countId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
}

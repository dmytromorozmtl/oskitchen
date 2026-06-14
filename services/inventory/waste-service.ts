import type { WasteReason } from "@prisma/client";

import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  ingredientListWhereForOwner,
  ownerScopedAnd,
} from "@/lib/scope/workspace-resource-scope";

export async function logWasteEvent(
  userId: string,
  data: {
    ingredientId: string;
    quantity: number;
    unit: string;
    reason: WasteReason;
    cost?: number;
    notes?: string;
    recordedById: string;
  },
) {
  const ingredientScope = await ingredientListWhereForOwner(userId);
  const workspaceId = await resolveOwnerWorkspaceId(userId);

  const event = await prisma.$transaction(async (tx) => {
    const updated = await tx.ingredient.updateMany({
      where: { AND: [ingredientScope, { id: data.ingredientId }] },
      data: { currentStock: { decrement: data.quantity } },
    });
    if (updated.count === 0) {
      throw new Error("Ingredient not found");
    }

    return tx.wasteEvent.create({
      data: {
        userId,
        workspaceId,
        ingredientId: data.ingredientId,
        quantity: data.quantity,
        unit: data.unit,
        reason: data.reason,
        cost: data.cost ?? 0,
        notes: data.notes ?? null,
        recordedById: data.recordedById,
      },
    });
  });

  await recordAuditLog({
    userId,
    workspaceId,
    action: "inventory.waste_logged",
    entityType: "WasteEvent",
    entityId: event.id,
    metadata: {
      ingredientId: data.ingredientId,
      quantity: data.quantity,
      unit: data.unit,
      reason: data.reason,
    },
  });

  return event;
}

export async function getWasteSummary(userId: string, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const events = await prisma.wasteEvent.findMany({
    where: await ownerScopedAnd(userId, { createdAt: { gte: since } }),
    include: { ingredient: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const byReason: Record<string, { count: number; totalCost: number }> = {};
  for (const e of events) {
    if (!byReason[e.reason]) byReason[e.reason] = { count: 0, totalCost: 0 };
    byReason[e.reason].count += 1;
    byReason[e.reason].totalCost += Number(e.cost);
  }

  return {
    totalEvents: events.length,
    totalCost: events.reduce((s, e) => s + Number(e.cost), 0),
    byReason,
    events: events.slice(0, 50),
  };
}

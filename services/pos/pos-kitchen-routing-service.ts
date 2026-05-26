import { endOfDay } from "date-fns";
import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";
import { defaultProductionModeForBusiness } from "@/lib/production/production-modes";
import type { ProductionSourceType } from "@prisma/client";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { orderByIdWhereForOwner } from "@/lib/scope/workspace-order-scope";
import { ownerScopedAnd } from "@/lib/scope/workspace-resource-scope";

import { posRoutingForProductCategory } from "@/lib/pos/pos-routing-rules";

/**
 * Creates `ProductionWorkItem` rows for POS orders when routing says kitchen prep is required.
 * Grab-and-go / beverage SKUs typically skip work items.
 */
export async function enqueueKitchenRoutingForPosOrder(userId: string, orderId: string): Promise<void> {
  const orderWhere = await orderByIdWhereForOwner(userId, orderId);
  const order = await prisma.order.findFirst({
    where: orderWhere,
    include: { orderItems: { include: { product: true } } },
  });
  if (!order) return;

  const eligible = order.orderItems.filter((line) => {
    const pr = line.product;
    if (!pr || !line.productId) return false;
    const route = posRoutingForProductCategory(pr.category);
    return route !== "NO_KITCHEN_REQUIRED" && route !== "READY_NOW";
  });
  if (eligible.length === 0) return;

  const settings = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { businessType: true },
  });
  const mode = defaultProductionModeForBusiness(settings?.businessType ?? null);
  const dayStart = order.pickupDate ?? new Date(order.createdAt);
  const batchTitle = `POS ${dayStart.toISOString().slice(0, 10)}`;
  const batchId = randomUUID();
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  const workItemScope = await ownerScopedAnd(userId, { sourceType: "ORDER" as ProductionSourceType });

  await prisma.$transaction(async (tx) => {
    await tx.productionBatch.create({
      data: {
        id: batchId,
        userId,
        workspaceId,
        orderId: order.id,
        brandId: order.brandId,
        locationId: order.locationId,
        productionDate: dayStart,
        title: batchTitle,
        mode,
        status: "ACTIVE",
        sourceType: "ORDER",
        totalItems: 0,
        completedItems: 0,
      },
    });

    for (const line of eligible) {
      const pr = line.product!;
      const route = posRoutingForProductCategory(pr.category);

      const exists = await tx.productionWorkItem.findFirst({
        where: { AND: [workItemScope, { orderItemId: line.id }] },
      });
      if (exists) continue;

      const wi = await tx.productionWorkItem.create({
        data: {
          id: randomUUID(),
          userId,
          workspaceId,
          batchId,
          brandId: order.brandId,
          locationId: order.locationId,
          orderId: order.id,
          orderItemId: line.id,
          productId: line.productId!,
          title: pr.title,
          quantity: line.quantity,
          station: "POS",
          stage: "To prep",
          status: "TO_PREP",
          sourceType: "ORDER" as ProductionSourceType,
          priority: "NORMAL",
          dueAt: order.pickupDate ? endOfDay(order.pickupDate) : endOfDay(order.createdAt),
          requiresPacking:
            route === "SEND_TO_PACKING" ||
            route === "SEND_TO_PRODUCTION_LATER" ||
            route === "CUSTOM",
          requiresLabel: Boolean(pr.allergens?.trim()),
          allergenWarning: pr.allergens ?? null,
          notes: line.notes ?? pr.kitchenNotes ?? null,
        },
      });

      await tx.productionWorkEvent.create({
        data: {
          id: randomUUID(),
          workItemId: wi.id,
          batchId,
          eventType: "CREATED",
          performedBy: userId,
          metadataJson: { orderId: order.id, source: "POS" },
        },
      });
    }

    const count = await tx.productionWorkItem.count({ where: { batchId } });
    if (count === 0) {
      await tx.productionBatch.delete({ where: { id: batchId } });
    } else {
      await tx.productionBatch.update({ where: { id: batchId }, data: { totalItems: count } });
    }
  });
}

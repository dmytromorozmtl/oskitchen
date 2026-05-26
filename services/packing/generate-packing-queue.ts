import type { PackingCommandMode, Prisma } from "@prisma/client";
import { format } from "date-fns";

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";
import { defaultRequiresLabelForMode } from "@/lib/packing/packing-modes";
import { shouldRequireAllergenCheck, shouldRequireNutritionLabel } from "@/lib/packing/packing-validation";

export type GeneratePackingQueueInput = {
  userId: string;
  packingDate: Date;
  mode: PackingCommandMode;
};

function aggregateLabelStatus(
  rows: { requiresLabel: boolean; requiresNutritionLabel: boolean; labelPrintedAt: Date | null }[],
): "NOT_REQUIRED" | "PENDING" | "PARTIAL" | "COMPLETE" {
  const needs = rows.filter((r) => r.requiresLabel || r.requiresNutritionLabel);
  if (!needs.length) return "NOT_REQUIRED";
  const printed = needs.filter((r) => r.labelPrintedAt);
  if (printed.length === 0) return "PENDING";
  if (printed.length === needs.length) return "COMPLETE";
  return "PARTIAL";
}

export async function generatePackingQueue(input: GeneratePackingQueueInput): Promise<{
  ok: true;
  batchId: string;
  tasksCreated: number;
}> {
  const { userId, packingDate, mode } = input;
  const requiresLabelDefault = defaultRequiresLabelForMode(mode);

  const ownerScope = await orderListWhereForOwner(userId);
  const orders = await prisma.order.findMany({
    where: {
      AND: [ownerScope, { status: { in: ["CONFIRMED", "PREPARING", "READY"] } }],
    },
    include: {
      orderItems: {
        include: {
          product: {
            include: { nutritionProfile: { select: { id: true } } },
          },
        },
      },
    },
    orderBy: { pickupDate: "asc" },
  });

  const candidateItemIds = orders.flatMap((o) => o.orderItems.map((i) => i.id));

  const existing = candidateItemIds.length
    ? await prisma.packingTask.findMany({
        where: {
          userId,
          orderItemId: { in: candidateItemIds },
          status: { notIn: ["HANDED_OFF", "CANCELLED"] },
        },
        select: { orderItemId: true },
      })
    : [];

  const blocked = new Set(
    existing.map((e) => e.orderItemId).filter((id): id is string => Boolean(id)),
  );

  const title = `Packing ${format(packingDate, "MMM d, yyyy")}`;
  const workspaceId = await resolveOwnerWorkspaceId(userId);

  const result = await prisma.$transaction(async (tx) => {
    const batch = await tx.packingBatch.create({
      data: {
        userId,
        workspaceId,
        title,
        packingDate,
        mode,
        status: "ACTIVE",
        fulfillmentType: null,
        totalOrders: 0,
        totalItems: 0,
        packedItems: 0,
        labelStatus: "PENDING",
        verificationStatus: "NOT_STARTED",
      },
    });

    const taskData: Prisma.PackingTaskCreateManyInput[] = [];

    for (const order of orders) {
      for (const item of order.orderItems) {
        if (blocked.has(item.id)) continue;
        if (!item.product || !item.productId) continue;

        const allergens = item.product.allergens;
        const requiresAllergen = shouldRequireAllergenCheck(allergens ?? undefined);
        const requiresNutrition = shouldRequireNutritionLabel(
          item.product.nutritionProfile !== null && item.product.nutritionProfile !== undefined,
        );
        const requiresLabel =
          requiresLabelDefault || requiresNutrition || Boolean(allergens?.trim());

        const allergenWarningsJson: Prisma.InputJsonValue | undefined = allergens?.trim()
          ? { source: "product.allergens", text: allergens.trim() }
          : undefined;

        taskData.push({
          userId,
          batchId: batch.id,
          orderId: order.id,
          orderItemId: item.id,
          productId: item.productId,
          customerId: null,
          brandId: order.brandId,
          locationId: order.locationId,
          title: `${item.product.title} · ${order.customerName}`,
          quantity: item.quantity,
          unit: null,
          fulfillmentType: order.fulfillmentType,
          pickupWindow: null,
          deliveryWindow: null,
          routeId: null,
          status: "QUEUED",
          priority: "NORMAL",
          requiresLabel,
          requiresNutritionLabel: requiresNutrition,
          requiresAllergenCheck: requiresAllergen,
          allergenWarningsJson,
        });
      }
    }

    let created = 0;
    if (taskData.length) {
      const res = await tx.packingTask.createMany({ data: taskData });
      created = res.count;
    }

    const tasks = await tx.packingTask.findMany({
      where: { batchId: batch.id },
      select: {
        orderId: true,
        quantity: true,
        status: true,
        requiresLabel: true,
        requiresNutritionLabel: true,
        labelPrintedAt: true,
      },
    });

    const distinctOrders = new Set(tasks.map((t) => t.orderId));
    const totalItems = tasks.reduce((s, t) => s + t.quantity, 0);
    const packedItems = tasks
      .filter((t) => t.status === "PACKED" || t.status === "VERIFIED")
      .reduce((s, t) => s + t.quantity, 0);

    await tx.packingBatch.update({
      where: { id: batch.id },
      data: {
        totalOrders: distinctOrders.size,
        totalItems,
        packedItems,
        labelStatus: aggregateLabelStatus(tasks),
      },
    });

    return { batchId: batch.id, tasksCreated: created };
  });

  return { ok: true, ...result };
}

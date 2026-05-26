import { endOfDay, startOfDay } from "date-fns";
import { randomUUID } from "crypto";

import { recordAuditLog } from "@/lib/audit-log";
import { summarizeBatchYield, type BatchYieldSummary } from "@/services/production/batch-yield";
import { defaultProductionModeForBusiness } from "@/lib/production/production-modes";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-order-scope";
import { ownerScopedAnd, productListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import type {
  BusinessType,
  Prisma,
  ProductionCommandMode,
  ProductionSourceType,
  ProductionWorkStatus,
} from "@prisma/client";

export type GenerateMenuPrepOptions = {
  userId: string;
  productionDate: Date;
  mode?: ProductionCommandMode;
  businessType?: BusinessType | null;
  /** Multiplies work-item quantities (e.g. 2 = double batch). */
  scaleFactor?: number;
};

/**
 * Creates a batch + work items from menu products with `preparedDate` on the given calendar day.
 * Skips products that already have an open MENU-sourced work item for the same product.
 */
export async function generateProductionFromMenuProducts(
  opts: GenerateMenuPrepOptions,
): Promise<{ created: number; skipped: number; batchId: string; yieldSummary: BatchYieldSummary | null }> {
  const { userId, productionDate } = opts;
  const mode = opts.mode ?? defaultProductionModeForBusiness(opts.businessType ?? null);
  const dayStart = startOfDay(productionDate);
  const dayEnd = endOfDay(productionDate);

  const products = await prisma.product.findMany({
    where: await productListWhereForOwnerAnd(userId, {
      active: true,
      preparedDate: { gte: dayStart, lte: dayEnd },
    }),
    include: { menu: true },
  });

  if (!products.length) {
    return { created: 0, skipped: 0, batchId: "", yieldSummary: null };
  }

  const batchId = randomUUID();
  const batchTitle = `Prep ${dayStart.toISOString().slice(0, 10)}`;
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  const menuWorkItemScope = (await ownerScopedAnd(userId, {
    sourceType: "MENU",
    status: { notIn: ["DONE", "CANCELLED"] satisfies ProductionWorkStatus[] },
  })) as Prisma.ProductionWorkItemWhereInput;

  let created = 0;
  let skipped = 0;

  await prisma.$transaction(async (tx) => {
    await tx.productionBatch.create({
      data: {
        id: batchId,
        userId,
        workspaceId,
        productionDate: dayStart,
        title: batchTitle,
        mode,
        status: "ACTIVE",
        sourceType: "MENU",
        totalItems: 0,
        completedItems: 0,
        scaleFactor: Math.max(1, opts.scaleFactor ?? 1),
      },
    });

    const scale = Math.max(1, opts.scaleFactor ?? 1);

    for (const p of products) {
      const dup = await tx.productionWorkItem.findFirst({
        where: { AND: [menuWorkItemScope, { productId: p.id }] },
      });
      if (dup) {
        skipped += 1;
        continue;
      }

      const wi = await tx.productionWorkItem.create({
        data: {
          id: randomUUID(),
          userId,
          workspaceId,
          batchId,
          brandId: p.brandId,
          productId: p.id,
          title: p.title,
          description: p.kitchenNotes ?? p.description ?? null,
          quantity: Math.max(1, Math.round(1 * scale)),
          station: "PREP",
          stage: "To prep",
          status: "TO_PREP",
          sourceType: "MENU" as ProductionSourceType,
          priority: "NORMAL",
          dueAt: p.pickupDate ? endOfDay(p.pickupDate) : null,
          requiresPacking: true,
          requiresLabel: Boolean(p.allergens?.trim()),
          allergenWarning: p.allergens ?? null,
        },
        select: { id: true },
      });

      await tx.productionWorkEvent.create({
        data: {
          id: randomUUID(),
          workItemId: wi.id,
          batchId,
          eventType: "CREATED",
          performedBy: userId,
          metadataJson: { productId: p.id, menuId: p.menuId },
        },
      });

      created += 1;
    }

    const count = await tx.productionWorkItem.count({ where: { batchId } });
    if (count === 0) {
      await tx.productionBatch.delete({ where: { id: batchId } });
    } else {
      await tx.productionBatch.update({
        where: { id: batchId },
        data: { totalItems: count },
      });
    }
  });

  if (!created) {
    return { created: 0, skipped, batchId: "", yieldSummary: null };
  }

  await recordAuditLog({
    userId,
    action: "production.generated",
    entityType: "ProductionBatch",
    entityId: batchId,
    metadata: { source: "MENU", created, skipped, mode },
  });

  const yieldSummary = batchId ? await summarizeBatchYield(userId, batchId) : null;
  return { created, skipped, batchId, yieldSummary };
}

export type GenerateProductionResult = Awaited<ReturnType<typeof generateProductionFromMenuProducts>>;

/** Re-export yield helper for batch cooking UI. */
export { summarizeBatchYield, type BatchYieldSummary };

/**
 * Work items from open orders touching the production date (created day or pickup date).
 */
export async function generateProductionFromOrdersForDate(opts: GenerateMenuPrepOptions): Promise<{
  created: number;
  skipped: number;
  batchId: string;
  yieldSummary: BatchYieldSummary | null;
}> {
  const { userId, productionDate } = opts;
  const mode = opts.mode ?? defaultProductionModeForBusiness(opts.businessType ?? null);
  const dayStart = startOfDay(productionDate);
  const dayEnd = endOfDay(productionDate);

  const orders = await prisma.order.findMany({
    where: await orderListWhereForOwnerAnd(userId, {
      status: { in: ["PENDING", "CONFIRMED", "PREPARING"] },
      OR: [
        { createdAt: { gte: dayStart, lte: dayEnd } },
        { pickupDate: dayStart },
      ],
    }),
    include: {
      orderItems: { include: { product: true } },
    },
    take: 200,
  });

  const batchId = randomUUID();
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  const orderWorkItemScope = await ownerScopedAnd(userId, { sourceType: "ORDER" as ProductionSourceType });
  let created = 0;
  let skipped = 0;

  await prisma.$transaction(async (tx) => {
    await tx.productionBatch.create({
      data: {
        id: batchId,
        userId,
        workspaceId,
        productionDate: dayStart,
        title: `Orders ${dayStart.toISOString().slice(0, 10)}`,
        mode,
        status: "ACTIVE",
        sourceType: "ORDER",
        totalItems: 0,
        scaleFactor: Math.max(1, opts.scaleFactor ?? 1),
      },
    });

    const scale = Math.max(1, opts.scaleFactor ?? 1);

    for (const o of orders) {
      for (const line of o.orderItems) {
        const exists = await tx.productionWorkItem.findFirst({
          where: { AND: [orderWorkItemScope, { orderItemId: line.id }] },
        });
        if (exists) {
          skipped += 1;
          continue;
        }
        const pr = line.product;
        if (!pr || !line.productId) {
          skipped += 1;
          continue;
        }
        const wi = await tx.productionWorkItem.create({
          data: {
            id: randomUUID(),
            userId,
            workspaceId,
            batchId,
            brandId: o.brandId,
            locationId: o.locationId,
            orderId: o.id,
            orderItemId: line.id,
            productId: line.productId,
            title: pr.title,
            quantity: Math.max(1, Math.round(line.quantity * scale)),
            station: "PREP",
            stage: "To prep",
            status: "TO_PREP",
            sourceType: "ORDER",
            priority: "NORMAL",
            dueAt: o.pickupDate ? endOfDay(o.pickupDate) : null,
            requiresPacking: true,
            requiresLabel: Boolean(pr.allergens?.trim()),
            allergenWarning: pr.allergens ?? null,
          },
          select: { id: true },
        });

        await tx.productionWorkEvent.create({
          data: {
            id: randomUUID(),
            workItemId: wi.id,
            batchId,
            eventType: "CREATED",
            performedBy: userId,
            metadataJson: { orderId: o.id },
          },
        });
        created += 1;
      }
    }

    const count = await tx.productionWorkItem.count({ where: { batchId } });
    if (count === 0) {
      await tx.productionBatch.delete({ where: { id: batchId } });
    } else {
      await tx.productionBatch.update({
        where: { id: batchId },
        data: { totalItems: count },
      });
    }
  });

  if (!created) {
    return { created: 0, skipped, batchId: "", yieldSummary: null };
  }

  await recordAuditLog({
    userId,
    action: "production.generated",
    entityType: "ProductionBatch",
    entityId: batchId,
    metadata: { source: "ORDER", created, skipped, mode },
  });

  const yieldSummary = batchId ? await summarizeBatchYield(userId, batchId) : null;
  return { created, skipped, batchId, yieldSummary };
}

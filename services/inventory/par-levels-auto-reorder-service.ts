import {
  buildParReplenishmentSourceId,
  defaultParRequiredByDate,
  isBelowParLevel,
  suggestParReplenishmentQuantity,
  urgencyFromParGap,
} from "@/lib/inventory/par-levels-auto-reorder-p2-43-measurement";
import { lineTotalCost, sumMoney } from "@/lib/purchasing/purchasing-calculations";
import { prisma } from "@/lib/prisma";
import {
  ingredientListWhereForOwner,
  ownerScopedAnd,
  reorderQueueItemListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { findSupplierByName, nextPurchaseOrderNumber } from "@/services/purchasing/purchasing-service";

export type SyncParLevelsResult = {
  scanned: number;
  created: number;
  skippedExisting: number;
};

export type CreateDraftPosFromQueueResult = {
  poIds: string[];
  linesCreated: number;
  queueItemsClosed: number;
  skippedUnassigned: number;
  errors: string[];
};

export async function syncReorderQueueFromBelowParLevels(userId: string): Promise<SyncParLevelsResult> {
  const ingredientScope = await ingredientListWhereForOwner(userId);
  const ingredients = await prisma.ingredient.findMany({
    where: { AND: [ingredientScope, { active: true }] },
    select: {
      id: true,
      name: true,
      unit: true,
      purchaseUnit: true,
      supplier: true,
      parLevel: true,
      reorderPoint: true,
      currentStock: true,
    },
  });

  let created = 0;
  let skippedExisting = 0;

  for (const ing of ingredients) {
    const snapshot = {
      currentStock: Number(ing.currentStock),
      parLevel: Number(ing.parLevel),
      reorderPoint: ing.reorderPoint != null ? Number(ing.reorderPoint) : null,
    };
    if (!isBelowParLevel(snapshot)) continue;

    const suggested = suggestParReplenishmentQuantity(snapshot);
    if (suggested <= 0) continue;

    const sourceId = buildParReplenishmentSourceId(ing.id);
    const existing = await prisma.reorderQueueItem.findFirst({
      where: await ownerScopedAnd(userId, {
        ingredientId: ing.id,
        sourceType: "PAR_REPLENISHMENT",
        status: "OPEN",
      }),
    });
    if (existing) {
      skippedExisting += 1;
      continue;
    }

    const supplierRow = ing.supplier ? await findSupplierByName(userId, ing.supplier) : null;
    const supplierItem = supplierRow
      ? await prisma.supplierItem.findFirst({
          where: { supplierId: supplierRow.id, ingredientId: ing.id, active: true },
          select: { id: true, leadTimeDays: true },
        })
      : null;

    const leadTimeDays = supplierItem?.leadTimeDays ?? 7;
    const parGap = snapshot.parLevel - snapshot.currentStock;

    await prisma.reorderQueueItem.create({
      data: {
        userId,
        ingredientId: ing.id,
        supplierId: supplierRow?.id ?? null,
        sourceType: "PAR_REPLENISHMENT",
        sourceId,
        requiredQuantity: snapshot.parLevel,
        unit: ing.purchaseUnit ?? ing.unit,
        shortageQuantity: parGap,
        suggestedPurchaseQuantity: suggested,
        urgency: urgencyFromParGap(parGap, leadTimeDays),
        requiredByDate: defaultParRequiredByDate(new Date(), leadTimeDays),
        status: "OPEN",
        notes: `Par replenishment — stock ${snapshot.currentStock.toFixed(2)} below par ${snapshot.parLevel.toFixed(2)}`,
      },
    });
    created += 1;
  }

  return { scanned: ingredients.length, created, skippedExisting };
}

export async function createDraftPurchaseOrdersFromReorderQueue(
  userId: string,
): Promise<CreateDraftPosFromQueueResult> {
  const reorderScope = await reorderQueueItemListWhereForOwner(userId);
  const openItems = await prisma.reorderQueueItem.findMany({
    where: { AND: [reorderScope, { status: "OPEN" }] },
    include: {
      ingredient: {
        select: {
          id: true,
          name: true,
          unit: true,
          purchaseUnit: true,
          costPerUnit: true,
        },
      },
      supplier: { select: { id: true, name: true } },
    },
    orderBy: { requiredByDate: "asc" },
  });

  const poIds: string[] = [];
  const errors: string[] = [];
  let linesCreated = 0;
  let queueItemsClosed = 0;
  let skippedUnassigned = 0;

  const bySupplier = new Map<string, typeof openItems>();
  for (const item of openItems) {
    if (!item.supplierId) {
      skippedUnassigned += 1;
      continue;
    }
    const list = bySupplier.get(item.supplierId) ?? [];
    list.push(item);
    bySupplier.set(item.supplierId, list);
  }

  for (const [supplierId, items] of bySupplier) {
    const linePayloads: {
      queueItemId: string;
      ingredientId: string;
      supplierItemId: string | null;
      description: string;
      quantity: number;
      unit: string;
      unitCost: number;
      totalCost: number;
      requiredByDate: Date | null;
    }[] = [];

    for (const item of items) {
      const supplierItem = await prisma.supplierItem.findFirst({
        where: { supplierId, ingredientId: item.ingredientId, active: true },
        select: { id: true, unitCost: true, purchaseUnit: true },
        orderBy: { lastUpdatedAt: "desc" },
      });

      const quantity = Number(item.suggestedPurchaseQuantity);
      const unitCost = supplierItem
        ? Number(supplierItem.unitCost)
        : Number(item.ingredient.costPerUnit);
      const unit = item.unit || supplierItem?.purchaseUnit || item.ingredient.purchaseUnit || item.ingredient.unit;
      const totalCost = lineTotalCost(quantity, unitCost);

      linePayloads.push({
        queueItemId: item.id,
        ingredientId: item.ingredientId,
        supplierItemId: supplierItem?.id ?? null,
        description: item.ingredient.name,
        quantity,
        unit,
        unitCost,
        totalCost,
        requiredByDate: item.requiredByDate,
      });
    }

    if (linePayloads.length === 0) continue;

    const subtotal = sumMoney(linePayloads.map((l) => l.totalCost));
    const orderNumber = await nextPurchaseOrderNumber(userId);
    const supplierName = items[0]?.supplier?.name ?? "Supplier";

    const po = await prisma.purchaseOrder.create({
      data: {
        userId,
        supplierId,
        orderNumber,
        status: "DRAFT",
        sourceType: "PAR_REPLENISHMENT",
        subtotal,
        tax: 0,
        shipping: 0,
        total: subtotal,
        createdById: userId,
        notes: `Auto draft from reorder queue (${linePayloads.length} par/shortage lines) — ${supplierName}`,
        lines: {
          create: linePayloads.map((l) => ({
            ingredientId: l.ingredientId,
            supplierItemId: l.supplierItemId,
            description: l.description,
            quantity: l.quantity,
            unit: l.unit,
            unitCost: l.unitCost,
            totalCost: l.totalCost,
            requiredByDate: l.requiredByDate,
            notes: "Par replenishment / reorder queue",
          })),
        },
      },
    });

    await prisma.purchaseApprovalEvent.create({
      data: {
        purchaseOrderId: po.id,
        action: "CREATED_DRAFT",
        performedById: userId,
        notes: "Par levels auto-reorder P2-43",
      },
    });

    await prisma.reorderQueueItem.updateMany({
      where: { id: { in: linePayloads.map((l) => l.queueItemId) } },
      data: { status: "ADDED_TO_PO" },
    });

    poIds.push(po.id);
    linesCreated += linePayloads.length;
    queueItemsClosed += linePayloads.length;
  }

  if (openItems.length > 0 && poIds.length === 0 && skippedUnassigned === openItems.length) {
    errors.push("All open reorder items lack a supplier — assign suppliers before generating draft POs.");
  }

  return { poIds, linesCreated, queueItemsClosed, skippedUnassigned, errors };
}

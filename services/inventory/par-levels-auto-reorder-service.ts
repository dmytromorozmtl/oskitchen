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
  reorderQueueItemListWhereForOwner,
  supplierListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { nextPurchaseOrderNumber } from "@/services/purchasing/purchasing-service";

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

type ParCandidate = {
  ing: {
    id: string;
    name: string;
    unit: string;
    purchaseUnit: string | null;
    supplier: string | null;
    parLevel: unknown;
    reorderPoint: unknown;
    currentStock: unknown;
  };
  snapshot: { currentStock: number; parLevel: number; reorderPoint: number | null };
  suggested: number;
  sourceId: string;
  parGap: number;
};

function supplierItemPairKey(supplierId: string, ingredientId: string): string {
  return `${supplierId}:${ingredientId}`;
}

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

  const candidates: ParCandidate[] = [];
  for (const ing of ingredients) {
    const snapshot = {
      currentStock: Number(ing.currentStock),
      parLevel: Number(ing.parLevel),
      reorderPoint: ing.reorderPoint != null ? Number(ing.reorderPoint) : null,
    };
    if (!isBelowParLevel(snapshot)) continue;

    const suggested = suggestParReplenishmentQuantity(snapshot);
    if (suggested <= 0) continue;

    candidates.push({
      ing,
      snapshot,
      suggested,
      sourceId: buildParReplenishmentSourceId(ing.id),
      parGap: snapshot.parLevel - snapshot.currentStock,
    });
  }

  if (candidates.length === 0) {
    return { scanned: ingredients.length, created: 0, skippedExisting: 0 };
  }

  const reorderScope = await reorderQueueItemListWhereForOwner(userId);
  const existingItems = await prisma.reorderQueueItem.findMany({
    where: {
      AND: [
        reorderScope,
        {
          ingredientId: { in: candidates.map((c) => c.ing.id) },
          sourceType: "PAR_REPLENISHMENT",
          status: "OPEN",
        },
      ],
    },
    select: { ingredientId: true },
  });
  const existingIngredientIds = new Set(existingItems.map((item) => item.ingredientId));

  const toCreate = candidates.filter((c) => !existingIngredientIds.has(c.ing.id));
  const skippedExisting = candidates.length - toCreate.length;

  if (toCreate.length === 0) {
    return { scanned: ingredients.length, created: 0, skippedExisting };
  }

  const supplierNames = [
    ...new Set(
      toCreate
        .map((c) => c.ing.supplier?.trim())
        .filter((name): name is string => Boolean(name)),
    ),
  ];

  const supplierScope = await supplierListWhereForOwner(userId);
  const suppliers =
    supplierNames.length > 0
      ? await prisma.supplier.findMany({
          where: {
            AND: [supplierScope, { name: { in: supplierNames }, active: true }],
          },
          select: { id: true, name: true },
        })
      : [];
  const supplierByName = new Map(suppliers.map((s) => [s.name, s]));

  const supplierIds = suppliers.map((s) => s.id);
  const ingredientIds = toCreate.map((c) => c.ing.id);
  const supplierItems =
    supplierIds.length > 0
      ? await prisma.supplierItem.findMany({
          where: {
            supplierId: { in: supplierIds },
            ingredientId: { in: ingredientIds },
            active: true,
          },
          select: { id: true, supplierId: true, ingredientId: true, leadTimeDays: true },
        })
      : [];
  const supplierItemByPair = new Map(
    supplierItems.map((si) => [supplierItemPairKey(si.supplierId, si.ingredientId), si]),
  );

  const createData = toCreate.map(({ ing, snapshot, suggested, sourceId, parGap }) => {
    const supplierRow = ing.supplier ? (supplierByName.get(ing.supplier.trim()) ?? null) : null;
    const supplierItem = supplierRow
      ? (supplierItemByPair.get(supplierItemPairKey(supplierRow.id, ing.id)) ?? null)
      : null;
    const leadTimeDays = supplierItem?.leadTimeDays ?? 7;

    return {
      userId,
      ingredientId: ing.id,
      supplierId: supplierRow?.id ?? null,
      sourceType: "PAR_REPLENISHMENT" as const,
      sourceId,
      requiredQuantity: snapshot.parLevel,
      unit: ing.purchaseUnit ?? ing.unit,
      shortageQuantity: parGap,
      suggestedPurchaseQuantity: suggested,
      urgency: urgencyFromParGap(parGap, leadTimeDays),
      requiredByDate: defaultParRequiredByDate(new Date(), leadTimeDays),
      status: "OPEN" as const,
      notes: `Par replenishment — stock ${snapshot.currentStock.toFixed(2)} below par ${snapshot.parLevel.toFixed(2)}`,
    };
  });

  const result = await prisma.reorderQueueItem.createMany({ data: createData });

  return {
    scanned: ingredients.length,
    created: result.count,
    skippedExisting,
  };
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
    const ingredientIds = items.map((item) => item.ingredientId);
    const supplierItemsRaw = await prisma.supplierItem.findMany({
      where: { supplierId, ingredientId: { in: ingredientIds }, active: true },
      select: {
        id: true,
        ingredientId: true,
        unitCost: true,
        purchaseUnit: true,
        lastUpdatedAt: true,
      },
      orderBy: { lastUpdatedAt: "desc" },
    });

    const supplierItemByIngredient = new Map<
      string,
      (typeof supplierItemsRaw)[number]
    >();
    for (const si of supplierItemsRaw) {
      const prev = supplierItemByIngredient.get(si.ingredientId);
      if (!prev || si.lastUpdatedAt > prev.lastUpdatedAt) {
        supplierItemByIngredient.set(si.ingredientId, si);
      }
    }

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
      const supplierItem = supplierItemByIngredient.get(item.ingredientId) ?? null;

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

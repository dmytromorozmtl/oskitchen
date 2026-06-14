import type { PurchaseOrderSourceType, PurchaseOrderStatus, ReorderQueueItemStatus } from "@prisma/client";

import { deriveDisplayOverdue, sumMoney } from "@/lib/purchasing/purchasing-calculations";
import { PURCHASE_ORDER_STATUS_LABELS } from "@/lib/purchasing/purchasing-status";
import { suggestReorderQuantity, urgencyFromShortageAndDate } from "@/lib/purchasing/reorder-rules";
import type { SupplierSummary } from "@/lib/purchasing/supplier-types";
import { prisma } from "@/lib/prisma";
import {
  ingredientListWhereForOwner,
  ownerScopedAnd,
  purchaseOrderListWhereForOwner,
  reorderQueueItemListWhereForOwner,
  supplierListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { loadDemandCommandCenterPayload } from "@/services/ingredient-demand/demand-service";

export type PurchasingDashboard = {
  demand: Awaited<ReturnType<typeof loadDemandCommandCenterPayload>>;
  suppliers: SupplierSummary[];
  reorderOpenCount: number;
  reorderSample: {
    id: string;
    ingredientName: string;
    suggested: number;
    unit: string;
    urgency: string;
    status: ReorderQueueItemStatus;
  }[];
  poByStatus: Partial<Record<PurchaseOrderStatus, number>>;
  draftPoCount: number;
  awaitingApprovalCount: number;
  sentPoCount: number;
  overduePoCount: number;
  estimatedOpenSpend: number;
  recentPurchaseOrders: {
    id: string;
    orderNumber: string;
    status: PurchaseOrderStatus;
    supplierName: string;
    total: number;
    requestedDeliveryDate: string | null;
    updatedAt: string;
  }[];
  recentReceiving: {
    id: string;
    purchaseOrderId: string;
    ingredientId: string;
    receivedQuantity: number;
    unit: string;
    receivedAt: string;
  }[];
  recentPriceChanges: {
    id: string;
    ingredientId: string;
    oldUnitCost: number | null;
    newUnitCost: number;
    effectiveAt: string;
    source: string;
  }[];
  ingredientsMissingSupplier: number;
};

export async function loadPurchasingDashboard(userId: string): Promise<PurchasingDashboard> {
  const demand = await loadDemandCommandCenterPayload(userId);

  const [supplierScope, reorderScope, purchaseOrderScope, ingredientScope] = await Promise.all([
    supplierListWhereForOwner(userId),
    reorderQueueItemListWhereForOwner(userId),
    purchaseOrderListWhereForOwner(userId),
    ingredientListWhereForOwner(userId),
  ]);

  const [
    suppliersRaw,
    reorderOpenCount,
    reorderSample,
    poGroups,
    recentPOs,
    receiving,
    prices,
    ingredients,
  ] = await Promise.all([
    prisma.supplier.findMany({
      where: { AND: [supplierScope, { active: true }] },
      select: {
        id: true,
        name: true,
        active: true,
        email: true,
        leadTimeDays: true,
        _count: { select: { items: true, purchaseOrders: true } },
      },
      orderBy: { name: "asc" },
      take: 200,
    }),
    prisma.reorderQueueItem.count({ where: { AND: [reorderScope, { status: "OPEN" }] } }),
    prisma.reorderQueueItem.findMany({
      where: { AND: [reorderScope, { status: "OPEN" }] },
      take: 8,
      orderBy: { requiredByDate: "asc" },
      include: { ingredient: { select: { name: true } } },
    }),
    prisma.purchaseOrder.groupBy({
      by: ["status"],
      where: purchaseOrderScope,
      _count: { _all: true },
    }),
    prisma.purchaseOrder.findMany({
      where: purchaseOrderScope,
      take: 12,
      orderBy: { updatedAt: "desc" },
      include: { supplier: { select: { name: true } } },
    }),
    prisma.receivingEvent.findMany({
      where: { purchaseOrder: purchaseOrderScope },
      take: 15,
      orderBy: { receivedAt: "desc" },
      select: {
        id: true,
        purchaseOrderId: true,
        ingredientId: true,
        receivedQuantity: true,
        unit: true,
        receivedAt: true,
      },
    }),
    prisma.supplierPriceHistory.findMany({
      where: { ingredient: ingredientScope },
      take: 20,
      orderBy: { effectiveAt: "desc" },
      select: {
        id: true,
        ingredientId: true,
        oldUnitCost: true,
        newUnitCost: true,
        effectiveAt: true,
        source: true,
      },
    }),
    prisma.ingredient.findMany({
      where: { AND: [ingredientScope, { active: true, supplier: null }] },
      select: { id: true },
      take: 500,
    }),
  ]);

  const poByStatus = Object.fromEntries(
    poGroups.map((g) => [g.status, g._count._all]),
  ) as Partial<Record<PurchaseOrderStatus, number>>;

  const draftPoCount = poByStatus.DRAFT ?? 0;
  const awaitingApprovalCount = (poByStatus.READY_FOR_REVIEW ?? 0) + (poByStatus.APPROVED ?? 0);
  const sentPoCount = (poByStatus.SENT ?? 0) + (poByStatus.PARTIALLY_RECEIVED ?? 0);
  const now = new Date();
  let overduePoCount = poByStatus.OVERDUE ?? 0;
  for (const po of recentPOs) {
    if (deriveDisplayOverdue(po.status, po.requestedDeliveryDate, now) && po.status !== "OVERDUE") {
      overduePoCount += 1;
    }
  }

  const openTotals = await prisma.purchaseOrder.findMany({
    where: {
      AND: [
        purchaseOrderScope,
        { status: { in: ["DRAFT", "READY_FOR_REVIEW", "APPROVED", "SENT", "PARTIALLY_RECEIVED", "OVERDUE"] } },
      ],
    },
    select: { total: true },
  });
  const estimatedOpenSpend = sumMoney(openTotals.map((p) => Number(p.total)));

  const suppliers: SupplierSummary[] = suppliersRaw.map((s) => ({
    id: s.id,
    name: s.name,
    active: s.active,
    itemCount: s._count.items,
    openPoCount: s._count.purchaseOrders,
    contactEmail: s.email,
    leadTimeDays: s.leadTimeDays,
  }));

  const ingredientsMissingSupplier = ingredients.length;

  return {
    demand,
    suppliers,
    reorderOpenCount,
    reorderSample: reorderSample.map((r) => ({
      id: r.id,
      ingredientName: r.ingredient.name,
      suggested: Number(r.suggestedPurchaseQuantity),
      unit: r.unit,
      urgency: r.urgency,
      status: r.status,
    })),
    poByStatus,
    draftPoCount,
    awaitingApprovalCount,
    sentPoCount,
    overduePoCount,
    estimatedOpenSpend,
    recentPurchaseOrders: recentPOs.map((p) => ({
      id: p.id,
      orderNumber: p.orderNumber,
      status: p.status,
      supplierName: p.supplier.name,
      total: Number(p.total),
      requestedDeliveryDate: p.requestedDeliveryDate?.toISOString() ?? null,
      updatedAt: p.updatedAt.toISOString(),
    })),
    recentReceiving: receiving.map((e) => ({
      id: e.id,
      purchaseOrderId: e.purchaseOrderId,
      ingredientId: e.ingredientId,
      receivedQuantity: Number(e.receivedQuantity),
      unit: e.unit,
      receivedAt: e.receivedAt.toISOString(),
    })),
    recentPriceChanges: prices.map((h) => ({
      id: h.id,
      ingredientId: h.ingredientId,
      oldUnitCost: h.oldUnitCost != null ? Number(h.oldUnitCost) : null,
      newUnitCost: Number(h.newUnitCost),
      effectiveAt: h.effectiveAt.toISOString(),
      source: h.source,
    })),
    ingredientsMissingSupplier,
  };
}

export { PURCHASE_ORDER_STATUS_LABELS };

export async function nextPurchaseOrderNumber(userId: string): Promise<string> {
  void userId;
  return `PO-${Date.now().toString(36).toUpperCase()}`;
}

export async function findSupplierByName(userId: string, name: string): Promise<{ id: string } | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;
  return prisma.supplier.findFirst({
    where: { AND: [await supplierListWhereForOwner(userId), { name: trimmed, active: true }] },
    select: { id: true },
  });
}

export async function seedReorderQueueFromDemandShortages(userId: string): Promise<{ created: number }> {
  const demand = await loadDemandCommandCenterPayload(userId);
  const ingredientScope = await ingredientListWhereForOwner(userId);
  const ingredients = await prisma.ingredient.findMany({
    where: ingredientScope,
    select: { id: true, parLevel: true, currentStock: true },
  });
  const ingMap = new Map(ingredients.map((i) => [i.id, i]));

  let created = 0;
  for (const row of demand.rows) {
    if (row.shortage <= 0 && !row.conversionRequired) continue;
    const requiredBy = new Date(`${row.dateKey}T12:00:00.000Z`);
    const ing = ingMap.get(row.ingredientId);
    const suggested = suggestReorderQuantity({
      shortage: row.shortage > 0 ? row.shortage : 0,
      parLevel: ing ? Number(ing.parLevel) : 0,
      currentStock: ing ? Number(ing.currentStock) : row.stock,
    });
    if (suggested <= 0) continue;

    const existing = await prisma.reorderQueueItem.findFirst({
      where: await ownerScopedAnd(userId, {
        ingredientId: row.ingredientId,
        requiredByDate: requiredBy,
        status: "OPEN",
      }),
    });
    if (existing) continue;

    const supplierRow = await findSupplierByName(userId, row.supplier ?? "");
    await prisma.reorderQueueItem.create({
      data: {
        userId,
        ingredientId: row.ingredientId,
        supplierId: supplierRow?.id ?? null,
        sourceType: "SHORTAGE",
        sourceId: `demand-live:${row.dateKey}`,
        requiredQuantity: row.required,
        unit: row.unit,
        shortageQuantity: row.shortage > 0 ? row.shortage : null,
        suggestedPurchaseQuantity: suggested,
        urgency: urgencyFromShortageAndDate(row.shortage, requiredBy),
        requiredByDate: requiredBy,
        status: "OPEN",
        notes: row.relatedProducts.length ? `Products: ${row.relatedProducts.slice(0, 6).join(", ")}` : null,
      },
    });
    created += 1;
  }
  return { created };
}

import { prisma } from "@/lib/prisma";
import {
  costSnapshotListWhereForOwner,
  costingRunListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

export const DEFAULT_FOOD_COST_RATIO = 0.32;

export type ProductCogsRecord = {
  productId: string;
  ingredientCostPerUnit: number;
  laborCostPerUnit: number;
  packagingCostPerUnit: number;
  primeCostPerUnit: number;
  source: "profitability_line" | "cost_snapshot";
};

export type OrderLineForCogs = {
  productId: string | null;
  quantity: number;
  unitPrice?: unknown;
  lineTotal?: unknown;
  title?: string | null;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function lineRevenue(qty: number, unitPrice: unknown, lineTotal: unknown): number {
  if (lineTotal != null) return Number(lineTotal);
  return qty * Number(unitPrice ?? 0);
}

/** Latest recipe-backed unit costs from the most recent costing run or cost snapshots. */
export async function loadProductCogsMap(
  userId: string,
  productIds: string[],
): Promise<Map<string, ProductCogsRecord>> {
  const map = new Map<string, ProductCogsRecord>();
  const uniqueIds = [...new Set(productIds.filter(Boolean) as string[])];
  if (uniqueIds.length === 0) return map;

  const costingScope = await costingRunListWhereForOwner(userId);
  const latestRun = await prisma.costingRun.findFirst({
    where: { AND: [costingScope, { status: "COMPLETED" }] },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (latestRun) {
    const lines = await prisma.profitabilityLine.findMany({
      where: { runId: latestRun.id, productId: { in: uniqueIds } },
      select: {
        productId: true,
        ingredientCost: true,
        laborCost: true,
        packagingCost: true,
      },
    });
    for (const l of lines) {
      const ing = Number(l.ingredientCost);
      const lab = Number(l.laborCost);
      const pack = Number(l.packagingCost);
      map.set(l.productId, {
        productId: l.productId,
        ingredientCostPerUnit: ing,
        laborCostPerUnit: lab,
        packagingCostPerUnit: pack,
        primeCostPerUnit: ing + lab + pack,
        source: "profitability_line",
      });
    }
  }

  const missing = uniqueIds.filter((id) => !map.has(id));
  if (missing.length > 0) {
    const costWhere = await costSnapshotListWhereForOwner(userId);
    const snapshots = await prisma.costSnapshot.findMany({
      where: { AND: [costWhere, { productId: { in: missing } }] },
      orderBy: { createdAt: "desc" },
      select: {
        productId: true,
        ingredientCost: true,
        laborCost: true,
        packagingCost: true,
      },
    });
    for (const s of snapshots) {
      if (map.has(s.productId)) continue;
      const ing = Number(s.ingredientCost);
      const lab = Number(s.laborCost);
      const pack = Number(s.packagingCost);
      map.set(s.productId, {
        productId: s.productId,
        ingredientCostPerUnit: ing,
        laborCostPerUnit: lab,
        packagingCostPerUnit: pack,
        primeCostPerUnit: ing + lab + pack,
        source: "cost_snapshot",
      });
    }
  }

  return map;
}

export type LineCogsResult = {
  revenue: number;
  foodCost: number;
  primeCost: number;
  source: "recipe" | "estimated";
};

export function resolveLineCogs(
  line: OrderLineForCogs,
  cogsMap: Map<string, ProductCogsRecord>,
  fallbackRatio = DEFAULT_FOOD_COST_RATIO,
): LineCogsResult {
  const qty = line.quantity;
  const revenue = lineRevenue(qty, line.unitPrice, line.lineTotal);
  const pid = line.productId;
  if (pid) {
    const rec = cogsMap.get(pid);
    if (rec) {
      return {
        revenue: round2(revenue),
        foodCost: round2(rec.ingredientCostPerUnit * qty),
        primeCost: round2(rec.primeCostPerUnit * qty),
        source: "recipe",
      };
    }
  }
  const est = round2(revenue * fallbackRatio);
  return { revenue: round2(revenue), foodCost: est, primeCost: est, source: "estimated" };
}

export type OrderCogsResult = {
  foodCost: number;
  primeCost: number;
  revenue: number;
  recipeBackedLines: number;
  totalLines: number;
};

export function resolveOrderLinesCogs(
  lines: OrderLineForCogs[],
  orderTotal: number,
  cogsMap: Map<string, ProductCogsRecord>,
  fallbackRatio = DEFAULT_FOOD_COST_RATIO,
): OrderCogsResult {
  if (lines.length === 0) {
    const est = round2(Number(orderTotal) * fallbackRatio);
    return {
      foodCost: est,
      primeCost: est,
      revenue: round2(Number(orderTotal)),
      recipeBackedLines: 0,
      totalLines: 0,
    };
  }

  let foodCost = 0;
  let primeCost = 0;
  let revenue = 0;
  let recipeBacked = 0;

  for (const line of lines) {
    const r = resolveLineCogs(line, cogsMap, fallbackRatio);
    foodCost += r.foodCost;
    primeCost += r.primeCost;
    revenue += r.revenue;
    if (r.source === "recipe") recipeBacked += 1;
  }

  const orderRev = Number(orderTotal);
  const gap = orderRev - revenue;
  if (gap > 0.01) {
    const gapEst = round2(gap * fallbackRatio);
    foodCost = round2(foodCost + gapEst);
    primeCost = round2(primeCost + gapEst);
    revenue = round2(revenue + gap);
  }

  return {
    foodCost: round2(foodCost),
    primeCost: round2(primeCost),
    revenue: round2(revenue),
    recipeBackedLines: recipeBacked,
    totalLines: lines.length,
  };
}

export function orderTotalCost(
  primeCost: number,
  isDelivery: boolean,
  deliveryCostPerOrder: number,
): number {
  return round2(primeCost + (isDelivery ? deliveryCostPerOrder : 0));
}

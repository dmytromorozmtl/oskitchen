import { subMonths } from "date-fns";

import { prisma } from "@/lib/prisma";

export type SupplierPriceChartPoint = {
  date: string;
  price: number;
  supplierName: string;
  ingredientName: string;
  supplierItemId: string | null;
};

/**
 * Loads supplier price history points for charting (last N months, capped at 500 rows).
 *
 * @param userId - Tenant owner user id
 * @param options.ingredientId - Optional ingredient filter
 * @param options.months - Lookback window in months (default 6)
 */
export async function getSupplierPriceHistoryForChart(
  userId: string,
  options?: { ingredientId?: string; months?: number },
): Promise<SupplierPriceChartPoint[]> {
  const months = options?.months ?? 6;
  const since = subMonths(new Date(), months);

  const rows = await prisma.supplierPriceHistory.findMany({
    where: {
      ingredient: { userId },
      ...(options?.ingredientId ? { ingredientId: options.ingredientId } : {}),
      effectiveAt: { gte: since },
    },
    select: {
      effectiveAt: true,
      newUnitCost: true,
      supplierItemId: true,
      ingredient: { select: { name: true } },
      supplierItem: { select: { supplier: { select: { name: true } } } },
    },
    orderBy: { effectiveAt: "asc" },
    take: 500,
  });

  return rows.map((h) => ({
    date: h.effectiveAt.toISOString().slice(0, 10),
    price: Number(h.newUnitCost),
    supplierName: h.supplierItem?.supplier.name ?? "Manual / catalog",
    ingredientName: h.ingredient.name,
    supplierItemId: h.supplierItemId,
  }));
}

export type SupplierPriceComparisonRow = {
  ingredientId: string;
  ingredientName: string;
  suppliers: { supplierName: string; latestPrice: number; effectiveAt: string }[];
};

export async function compareSupplierPricesByIngredient(userId: string): Promise<SupplierPriceComparisonRow[]> {
  const rows = await prisma.supplierPriceHistory.findMany({
    where: { ingredient: { userId }, supplierItemId: { not: null } },
    include: {
      ingredient: { select: { id: true, name: true } },
      supplierItem: { include: { supplier: { select: { name: true } } } },
    },
    orderBy: { effectiveAt: "desc" },
    take: 1000,
  });

  const byIngredient = new Map<string, SupplierPriceComparisonRow>();
  for (const h of rows) {
    if (!h.supplierItem) continue;
    const ingId = h.ingredientId;
    let row = byIngredient.get(ingId);
    if (!row) {
      row = { ingredientId: ingId, ingredientName: h.ingredient.name, suppliers: [] };
      byIngredient.set(ingId, row);
    }
    const supplierName = h.supplierItem.supplier.name;
    if (row.suppliers.some((s) => s.supplierName === supplierName)) continue;
    row.suppliers.push({
      supplierName,
      latestPrice: Number(h.newUnitCost),
      effectiveAt: h.effectiveAt.toISOString().slice(0, 10),
    });
  }

  return [...byIngredient.values()]
    .filter((r) => r.suppliers.length >= 2)
    .sort((a, b) => a.ingredientName.localeCompare(b.ingredientName))
    .slice(0, 40);
}

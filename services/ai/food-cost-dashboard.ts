import { subDays } from "date-fns";

import { buildFoodCostTrend30d } from "@/lib/ai/food-cost-dashboard-builders";
import type {
  FoodCostDashboardPayload,
  IngredientPriceSeries,
  WasteSummaryPayload,
} from "@/lib/ai/food-cost-dashboard-types";
import { computePriceTrend } from "@/lib/ai/food-cost-builders";
import { prisma } from "@/lib/prisma";
import { resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { resolveOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";
import { analyzeFoodCost } from "@/services/ai/food-cost-ai";
import { generateFoodCostAlerts } from "@/services/ai/food-cost-alerts";
import { getWasteSummary } from "@/services/inventory/waste-service";

export type { FoodCostDashboardPayload } from "@/lib/ai/food-cost-dashboard-types";

async function loadTrend30d(ownerUserId: string) {
  const since = subDays(new Date(), 30);
  const scope = await resolveOwnerScopedWhere(ownerUserId);

  const snapshots = await prisma.costSnapshot.findMany({
    where: { AND: [scope, { createdAt: { gte: since } }] },
    select: {
      createdAt: true,
      ingredientCost: true,
      salePrice: true,
      marginPercent: true,
    },
    orderBy: { createdAt: "asc" },
    take: 5000,
  });

  return buildFoodCostTrend30d(
    snapshots.map((s) => ({
      createdAt: s.createdAt,
      ingredientCost: Number(s.ingredientCost),
      salePrice: Number(s.salePrice),
      marginPercent: Number(s.marginPercent),
    })),
  );
}

async function loadIngredientPriceSeries(
  ownerUserId: string,
  ingredientIds: string[],
): Promise<IngredientPriceSeries[]> {
  if (ingredientIds.length === 0) return [];

  const since = subDays(new Date(), 30);
  const [history, ingredients] = await Promise.all([
    prisma.supplierPriceHistory.findMany({
      where: { ingredientId: { in: ingredientIds }, effectiveAt: { gte: since } },
      orderBy: { effectiveAt: "asc" },
      select: { ingredientId: true, newUnitCost: true, effectiveAt: true },
    }),
    prisma.ingredient.findMany({
      where: { id: { in: ingredientIds } },
      select: { id: true, name: true, unit: true, costPerUnit: true },
    }),
  ]);

  const ingById = new Map(ingredients.map((i) => [i.id, i]));
  const pointsByIng = new Map<string, { date: string; price: number }[]>();

  for (const row of history) {
    const list = pointsByIng.get(row.ingredientId) ?? [];
    list.push({
      date: row.effectiveAt.toISOString().slice(0, 10),
      price: Number(row.newUnitCost),
    });
    pointsByIng.set(row.ingredientId, list);
  }

  return ingredientIds.map((id) => {
    const ing = ingById.get(id);
    const points = pointsByIng.get(id) ?? [];
    if (points.length === 0 && ing) {
      points.push({
        date: new Date().toISOString().slice(0, 10),
        price: Number(ing.costPerUnit),
      });
    }
    const currentPrice = points[points.length - 1]?.price ?? Number(ing?.costPerUnit ?? 0);
    const previousPrice = points.length > 1 ? points[0]!.price : null;
    const { changePercent } = computePriceTrend(currentPrice, previousPrice);

    return {
      ingredientId: id,
      name: ing?.name ?? "Ingredient",
      unit: ing?.unit ?? "unit",
      currentPrice,
      changePercent,
      points,
    };
  });
}

function mapWasteSummary(raw: Awaited<ReturnType<typeof getWasteSummary>>): WasteSummaryPayload {
  return {
    totalEvents: raw.totalEvents,
    totalCost: raw.totalCost,
    byReason: raw.byReason,
    events: raw.events.map((e) => ({
      id: e.id,
      reason: e.reason,
      quantity: Number(e.quantity),
      unit: e.unit,
      cost: Number(e.cost),
      createdAt: e.createdAt.toISOString(),
      ingredientName: e.ingredient.name,
    })),
  };
}

/** Server bundle for Food Cost analytics dashboard. */
export async function loadFoodCostDashboard(workspaceId: string): Promise<FoodCostDashboardPayload> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${workspaceId}`);

  const analysis = await analyzeFoodCost(workspaceId);

  const topIngredientIds = analysis.topIngredientMovers
    .slice(0, 6)
    .map((i) => i.ingredientId);

  const [alerts, trend30d, wasteRaw, ingredientPriceSeries] = await Promise.all([
    generateFoodCostAlerts(workspaceId),
    loadTrend30d(ownerUserId),
    getWasteSummary(ownerUserId, 30),
    loadIngredientPriceSeries(ownerUserId, topIngredientIds),
  ]);

  return {
    analysis,
    alerts,
    trend30d,
    ingredientPriceSeries,
    waste: mapWasteSummary(wasteRaw),
  };
}

import { subDays } from "date-fns";

import { assembleFoodCostAnalysis } from "@/lib/ai/food-cost-builders";
import type { FoodCostAnalysis, FoodCostItemAnalysis } from "@/lib/ai/food-cost-types";
import { mergeCostingSettings } from "@/lib/costing/costing-settings";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  ingredientListWhereForOwner,
  recipeListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { loadCostingOverviewData } from "@/services/costing/costing-service";

export type { FoodCostAnalysis, FoodCostItemAnalysis } from "@/lib/ai/food-cost-types";

/**
 * Food Cost AI — recipe-level ingredient breakdown, price trends, margin analysis, and recommendations.
 * Deterministic engine using existing costing runs, recipes, and supplier price history.
 */
export async function analyzeFoodCost(workspaceId: string): Promise<FoodCostAnalysis> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const [costing, kitchen, recipes, ingredientScope] = await Promise.all([
    loadCostingOverviewData(ownerUserId),
    prisma.kitchenSettings.findUnique({
      where: { userId: ownerUserId },
      select: { costingSettingsJson: true },
    }),
    prisma.recipe.findMany({
      where: { AND: [await recipeListWhereForOwner(ownerUserId), { active: true }] },
      include: {
        ingredients: { include: { ingredient: true } },
      },
      take: 500,
    }),
    ingredientListWhereForOwner(ownerUserId),
  ]);

  const settings = mergeCostingSettings(kitchen?.costingSettingsJson ?? null);
  const targetFoodCostPercent = settings.foodCostTargetPercent ?? 32;

  const ingredientIds = [...new Set(recipes.flatMap((r) => r.ingredients.map((i) => i.ingredientId)))];
  const productUsage = new Map<string, number>();
  for (const r of recipes) {
    for (const line of r.ingredients) {
      productUsage.set(line.ingredientId, (productUsage.get(line.ingredientId) ?? 0) + 1);
    }
  }

  const since = subDays(new Date(), 90);
  const historyRows =
    ingredientIds.length === 0
      ? []
      : await prisma.supplierPriceHistory.findMany({
          where: { ingredientId: { in: ingredientIds }, effectiveAt: { gte: since } },
          orderBy: { effectiveAt: "desc" },
          select: {
            ingredientId: true,
            newUnitCost: true,
            effectiveAt: true,
          },
        });

  const ingredients =
    ingredientIds.length === 0
      ? []
      : await prisma.ingredient.findMany({
          where: { AND: [ingredientScope, { id: { in: ingredientIds }, active: true }] },
          select: { id: true, name: true, unit: true, costPerUnit: true },
        });

  const historyByIngredient = new Map<string, { current: number; previous: number | null }>();
  for (const row of historyRows) {
    const cost = Number(row.newUnitCost);
    const existing = historyByIngredient.get(row.ingredientId);
    if (!existing) {
      historyByIngredient.set(row.ingredientId, { current: cost, previous: null });
    } else if (existing.previous == null) {
      existing.previous = cost;
    }
  }

  const pricePoints = ingredients.map((ing) => {
    const hist = historyByIngredient.get(ing.id);
    const card = Number(ing.costPerUnit);
    return {
      ingredientId: ing.id,
      name: ing.name,
      unit: ing.unit,
      currentCostPerUnit: hist?.current ?? card,
      previousCostPerUnit: hist?.previous ?? null,
      usedInProductCount: productUsage.get(ing.id) ?? 0,
    };
  });

  const recipeLines = recipes.flatMap((r) =>
    r.ingredients.map((line) => ({
      productId: r.productId,
      ingredientId: line.ingredientId,
      ingredientName: line.ingredient.name,
      unit: line.ingredient.unit,
      quantity: Number(line.quantity),
      wastePercent: Number(line.wastePercent),
      costPerUnit:
        historyByIngredient.get(line.ingredientId)?.current ?? Number(line.ingredient.costPerUnit),
      yieldQuantity: Number(r.yieldQuantity),
    })),
  );

  const costingLines =
    costing.latestLines.length > 0
      ? costing.latestLines.map((l) => ({
          productId: l.productId,
          itemTitle: l.itemTitle,
          salePrice: l.salePrice,
          ingredientCost: l.ingredientCost,
          laborCost: l.laborCost,
          totalCost: l.totalCost,
          grossMarginPercent: l.grossMarginPercent,
          foodCostPercent: l.foodCostPercent,
          suggestedPrice: l.suggestedPrice,
          warningLevel: l.warningLevel,
        }))
      : recipes.map((r) => {
          const productLine = recipeLines.filter((l) => l.productId === r.productId);
          const ingredientCost = productLine.reduce((s, line) => {
            const yq = Math.max(line.yieldQuantity, 0.0001);
            const waste = 1 + line.wastePercent / 100;
            return s + (line.quantity / yq) * line.costPerUnit * waste;
          }, 0);
          return {
            productId: r.productId,
            itemTitle: r.name,
            salePrice: 0,
            ingredientCost,
            laborCost: 0,
            totalCost: ingredientCost,
            grossMarginPercent: 0,
            foodCostPercent: 0,
            suggestedPrice: null,
            warningLevel: "NONE",
          };
        });

  return assembleFoodCostAnalysis({
    workspaceId,
    targetMarginPercent: costing.targetMarginPercent,
    targetFoodCostPercent,
    costingLines,
    recipeLines,
    pricePoints,
    missingRecipes: costing.kpis.missingRecipes,
    recipeCount: costing.recipeCount,
  });
}

export async function analyzeFoodCostForProduct(
  workspaceId: string,
  productId: string,
): Promise<FoodCostItemAnalysis | null> {
  const analysis = await analyzeFoodCost(workspaceId);
  return analysis.itemAnalyses.find((i) => i.productId === productId) ?? null;
}

export async function analyzeFoodCostForUser(userId: string): Promise<FoodCostAnalysis> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) throw new Error(`No workspace for user: ${userId}`);
  return analyzeFoodCost(workspaceId);
}

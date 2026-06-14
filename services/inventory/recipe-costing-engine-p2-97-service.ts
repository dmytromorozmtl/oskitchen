import {
  buildRecipeCostingEngineReport,
  RECIPE_COSTING_ENGINE_DEMO_FIXTURE,
  type RecipeCostingEngineReport,
} from "@/lib/inventory/recipe-costing-engine-p2-97-operations";
import { RECIPE_COSTING_ENGINE_P2_97_POLICY_ID } from "@/lib/inventory/recipe-costing-engine-p2-97-policy";
import { mergeCostingSettings } from "@/lib/costing/costing-settings";
import { loadCostingOverviewData } from "@/services/costing/costing-service";
import { prisma } from "@/lib/prisma";

export type RecipeCostingEngineSnapshot = RecipeCostingEngineReport & {
  policyId: typeof RECIPE_COSTING_ENGINE_P2_97_POLICY_ID;
  mode: "live" | "demo";
  recipeCount: number;
};

export async function loadRecipeCostingEngineSnapshot(
  userId: string,
): Promise<RecipeCostingEngineSnapshot> {
  const kitchen = await prisma.kitchenSettings.findUnique({ where: { userId } });
  const settings = mergeCostingSettings(kitchen?.costingSettingsJson ?? null);
  const overview = await loadCostingOverviewData(userId);

  if (overview.latestLines.length > 0) {
    const items = overview.latestLines.map((line) => ({
      recipeId: line.productId,
      recipeName: line.itemTitle,
      salePrice: line.salePrice,
      yieldQuantity: 1,
      laborMinutes: 0,
      laborRatePerMinute: settings.defaultLaborRatePerMinute,
      recipePackagingCost: line.packagingCost,
      packagingRulesCost: 0,
      ingredients: [
        {
          quantity: 1,
          wastePercent: 0,
          costPerUnit: line.ingredientCost,
          ingredientId: line.productId,
          ingredientName: "Rolled ingredients",
        },
      ],
    }));

    const report = buildRecipeCostingEngineReport(items, overview.targetMarginPercent);

    return {
      policyId: RECIPE_COSTING_ENGINE_P2_97_POLICY_ID,
      mode: "live",
      recipeCount: overview.recipeCount,
      ...report,
    };
  }

  const report = buildRecipeCostingEngineReport(
    [...RECIPE_COSTING_ENGINE_DEMO_FIXTURE],
    settings.targetMarginPercent,
  );

  return {
    policyId: RECIPE_COSTING_ENGINE_P2_97_POLICY_ID,
    mode: "demo",
    recipeCount: overview.recipeCount,
    ...report,
  };
}

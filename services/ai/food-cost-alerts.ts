import { defaultFilters } from "@/lib/analytics/filters";
import {
  alertIngredientPriceSpikes,
  alertLowMarginItems,
  applyVolumeFromTopProductsByTitle,
  buildIngredientUsageMap,
  mergeFoodCostAlerts,
} from "@/lib/ai/food-cost-alerts-builders";
import type { FoodCostAlert } from "@/lib/ai/food-cost-alerts-types";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { analyzeFoodCost } from "@/services/ai/food-cost-ai";
import { loadExecutiveOverview } from "@/services/executive/executive-dashboard-service";
import { loadDemandCommandCenterPayload } from "@/services/ingredient-demand/demand-service";

export type {
  FoodCostAlert,
  FoodCostAlertType,
  FoodCostAlertSeverity,
} from "@/lib/ai/food-cost-alerts-types";
export {
  FOOD_COST_MARGIN_ALERT_THRESHOLD,
  FOOD_COST_INGREDIENT_SPIKE_THRESHOLD,
} from "@/lib/ai/food-cost-alerts-types";

/**
 * Food Cost Alerts — margin below 30% and ingredient price spikes above 10% with dollar impact.
 * AI-assisted deterministic thresholds using food cost analysis and demand volume.
 */
export async function generateFoodCostAlerts(workspaceId: string): Promise<FoodCostAlert[]> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const filters = defaultFilters();
  const windowDays = Math.max(
    1,
    Math.ceil((filters.to.getTime() - filters.from.getTime()) / 86_400_000),
  );

  const [analysis, executive, demand] = await Promise.all([
    analyzeFoodCost(workspaceId),
    loadExecutiveOverview({ userId: ownerUserId }, filters).catch(() => null),
    loadDemandCommandCenterPayload(ownerUserId).catch(() => ({ rows: [] })),
  ]);

  const volumeByProduct = applyVolumeFromTopProductsByTitle(
    analysis.itemAnalyses,
    executive?.topProducts ?? [],
    windowDays,
    new Map(),
  );

  const usageByIngredient = buildIngredientUsageMap(
    demand.rows.map((r) => ({ ingredientId: r.ingredientId, required: r.required })),
    windowDays,
  );

  const alerts: FoodCostAlert[] = [];
  alerts.push(
    ...alertLowMarginItems({
      items: analysis.itemAnalyses,
      volumeByProduct,
    }),
  );
  alerts.push(
    ...alertIngredientPriceSpikes({
      movers: analysis.topIngredientMovers,
      usageByIngredient,
    }),
  );

  return mergeFoodCostAlerts(alerts);
}

export async function generateFoodCostAlertsForUser(userId: string): Promise<FoodCostAlert[]> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) throw new Error(`No workspace for user: ${userId}`);
  return generateFoodCostAlerts(workspaceId);
}

/** Critical food cost alerts only — for briefing / notification surfaces. */
export async function generateCriticalFoodCostAlerts(workspaceId: string): Promise<FoodCostAlert[]> {
  const alerts = await generateFoodCostAlerts(workspaceId);
  return alerts.filter((a) => a.severity === "critical");
}

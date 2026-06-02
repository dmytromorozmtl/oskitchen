import type { WorkspaceMetricSnapshot } from "@/lib/ai/benchmark-network-types";
import type { FoodCostAnalysis } from "@/lib/ai/food-cost-types";
import type { ExecutiveOverview } from "@/services/executive/executive-dashboard-service";

function safePct(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return (numerator / denominator) * 100;
}

function avgLaborCostPercent(foodCost: FoodCostAnalysis | null): number | null {
  if (!foodCost || foodCost.itemAnalyses.length === 0) return null;
  const values = foodCost.itemAnalyses
    .filter((i) => i.salePrice > 0)
    .map((i) => (i.laborCost / i.salePrice) * 100);
  if (values.length === 0) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function buildWorkspaceMetricSnapshot(input: {
  windowDays: number;
  executive: ExecutiveOverview | null;
  foodCost: FoodCostAnalysis | null;
  laborCostPercent: number | null;
  kdsWaitMinutes: number | null;
}): WorkspaceMetricSnapshot {
  const { executive: ex, foodCost, windowDays } = input;
  const days = Math.max(1, windowDays);

  const productionTotal = ex?.productionTotal ?? 0;
  const wasteEstimate =
    productionTotal > 0 && ex
      ? ((ex.overdueProductionItems / productionTotal) * 100 * 0.6)
      : null;

  const purchasingBase = Math.max(1, (ex?.purchasingNeeds ?? 0) + (ex?.stalePurchaseOrders ?? 0));
  const taskBase = Math.max(1, (ex?.openTasks ?? 0) + (ex?.overdueTasks ?? 0));

  return {
    windowDays: days,
    foodCostPercent: foodCost?.overallFoodCostPercent ?? null,
    grossMarginPercent: foodCost?.overallGrossMarginPercent ?? ex?.marginMedian ?? null,
    laborCostPercent: input.laborCostPercent ?? avgLaborCostPercent(foodCost),
    avgTicket: ex?.aov ?? null,
    ordersPerDay: ex ? ex.orderCount / days : null,
    revenuePerDay: ex ? ex.netRevenue / days : null,
    wastePercent: wasteEstimate,
    repeatCustomerRate: ex?.repeatRate != null ? ex.repeatRate * 100 : null,
    productionCompletion: ex?.productionCompletion ?? null,
    packingAccuracy: ex?.packingAccuracy ?? null,
    deliveryCompletion: ex?.deliveryCompletion ?? null,
    inventoryShortageRate:
      ex != null
        ? safePct(ex.inventoryShortages + ex.imminentShortages, purchasingBase + ex.inventoryShortages)
        : null,
    poOverdueRate: ex != null ? safePct(ex.stalePurchaseOrders, purchasingBase) : null,
    marginMedian: ex?.marginMedian ?? null,
    healthScore: ex?.health.score ?? null,
    openTaskRate: ex != null ? safePct(ex.openTasks, taskBase) : null,
    cateringPipeline: ex?.cateringOpenPipeline ?? null,
    mealPlanActive: ex?.mealPlanActive ?? null,
    integrationFailureRate: ex?.failedIntegrations ?? null,
    revenueTrend: ex?.revenueTrend ?? null,
    orderTrend: ex?.orderTrend ?? null,
    kdsWaitMinutes: input.kdsWaitMinutes,
    channelCount: ex?.channelMix.length ?? null,
    menuVelocity: ex?.topProducts[0] ? ex.topProducts[0].quantity / days : null,
    costVarianceAlerts: ex?.costingVarianceAlerts.length ?? null,
    demandShortageLines:
      ex != null ? ex.inventoryShortages + ex.imminentShortages + ex.purchasingNeeds : null,
  };
}

import { defaultFilters } from "@/lib/analytics/filters";
import {
  buildDeterministicInsightsFromOverview,
  type DeterministicInsightsOverviewInput,
  type DeterministicSnapshot,
} from "@/lib/ai/deterministic-insights-from-overview";
import { loadExecutiveOverview } from "@/services/executive/executive-dashboard-service";

export type { DeterministicInsightsOverviewInput, DeterministicSnapshot };
export { buildDeterministicInsightsFromOverview };

/**
 * Reuse the Executive overview as the deterministic ground truth.
 * This guarantees the copilot and executive dashboard never disagree
 * about throughput / packing / margin / etc., and lets us evolve both
 * surfaces from one source. No PII leaves this function — the overview
 * already returns aggregates only.
 */
export async function buildDeterministicSnapshot(userId: string): Promise<DeterministicSnapshot> {
  const filters = defaultFilters();
  const overview = await loadExecutiveOverview({ userId }, filters);

  return buildDeterministicInsightsFromOverview({
    rangeLabel: overview.rangeLabel,
    orderCount: overview.orderCount,
    cancelledOrderCount: overview.cancelledOrderCount,
    failedIntegrations: overview.failedIntegrations,
    overdueProductionItems: overview.overdueProductionItems,
    packingAccuracy: overview.packingAccuracy,
    failedDeliveries: overview.failedDeliveries,
    inventoryShortages: overview.inventoryShortages,
    imminentShortages: overview.imminentShortages,
    purchasingNeeds: overview.purchasingNeeds,
    stalePurchaseOrders: overview.stalePurchaseOrders,
    cateringFollowUpsOverdue: overview.cateringFollowUpsOverdue,
    mealPlanCyclesMissing: overview.mealPlanCyclesMissing,
    overdueTasks: overview.overdueTasks,
    marginAtRiskItems: overview.marginAtRiskItems,
    repeatRate: overview.repeatRate,
  });
}

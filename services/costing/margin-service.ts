import { defaultFilters } from "@/lib/analytics/filters";
import { loadExecutiveOverview } from "@/services/executive/executive-dashboard-service";

export async function loadMarginSignals(userId: string) {
  const overview = await loadExecutiveOverview({ userId }, defaultFilters());
  return {
    rangeLabel: overview.rangeLabel,
    marginMedian: overview.marginMedian,
    marginAtRiskItems: overview.marginAtRiskItems,
  };
}

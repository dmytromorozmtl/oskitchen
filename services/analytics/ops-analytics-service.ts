import { defaultFilters } from "@/lib/analytics/filters";
import { loadExecutiveOverview } from "@/services/analytics/analytics-service";

export { loadExecutiveOverview } from "@/services/analytics/analytics-service";

/** Operational KPI snapshot — wraps executive overview with default window. */
export async function loadOpsKpiSnapshot(userId: string) {
  const filters = defaultFilters();
  return loadExecutiveOverview({ userId }, filters);
}

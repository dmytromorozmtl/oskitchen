import { defaultFilters } from "@/lib/analytics/filters";
import { loadExecutiveOverview } from "@/services/analytics/analytics-service";

/** Thin alias for dashboards that only need the KPI bundle. */
export async function loadKpiSnapshot(userId: string) {
  return loadExecutiveOverview({ userId }, defaultFilters());
}

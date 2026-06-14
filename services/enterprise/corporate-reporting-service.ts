import { endOfDay, startOfDay } from "@/lib/analytics/filters";
import { buildCorporateReportingDashboard } from "@/lib/enterprise/corporate-reporting-builders";
import { resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { loadForecasting2Snapshot } from "@/services/ai/forecasting";
import { loadLaborManagerSnapshot } from "@/services/ai/labor-manager";
import { loadExecutiveOverview } from "@/services/analytics/analytics-service";
import type { AnalyticsFilters } from "@/lib/analytics/filters";

export type { CorporateReportingDashboard } from "@/lib/enterprise/corporate-reporting-types";

function previousPeriodFilters(filters: AnalyticsFilters): AnalyticsFilters {
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.max(
    1,
    Math.ceil((filters.to.getTime() - filters.from.getTime()) / msPerDay) + 1,
  );
  const previousTo = endOfDay(new Date(filters.from.getTime() - msPerDay));
  const previousFrom = startOfDay(new Date(previousTo.getTime() - (days - 1) * msPerDay));
  return { ...filters, from: previousFrom, to: previousTo };
}

export async function loadCorporateReportingDashboard(workspaceId: string) {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const scope = { userId: ownerUserId };
  const { defaultFilters } = await import("@/lib/analytics/filters");
  const filters = defaultFilters();
  const prevFilters = previousPeriodFilters(filters);

  const [current, previous, forecast, laborResult] = await Promise.all([
    loadExecutiveOverview(scope, filters),
    loadExecutiveOverview(scope, prevFilters),
    loadForecasting2Snapshot(ownerUserId),
    loadLaborManagerSnapshot(ownerUserId).catch(() => null),
  ]);

  const laborPercent =
    laborResult && laborResult.summary.laborPercent > 0
      ? laborResult.summary.laborPercent
      : null;

  return buildCorporateReportingDashboard({
    workspaceId,
    current,
    previous,
    forecast,
    laborPercent,
    foodCostPercent: null,
  });
}

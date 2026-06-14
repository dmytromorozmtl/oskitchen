import type { AnalyticsFilters } from "@/lib/analytics/filters";
import { buildEnterpriseMultiLocationDashboard } from "@/lib/enterprise/multi-location-builders";
import type { MultiLocationDashboard2ViewState } from "@/lib/enterprise/multi-location-dashboard-2-builders";
import { buildMultiLocationRollup } from "@/lib/enterprise/multi-location-rollup-builders";
import type { EnterpriseMultiLocationDashboard } from "@/lib/enterprise/multi-location-types";
import { resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { loadMultiLocationAnalytics } from "@/services/analytics/multi-location-analytics";

export type { EnterpriseMultiLocationDashboard } from "@/lib/enterprise/multi-location-types";

export function parseMultiLocationDashboard2ViewState(
  sp: Record<string, string | string[] | undefined>,
): MultiLocationDashboard2ViewState {
  const read = (key: string) => (typeof sp[key] === "string" ? sp[key] : undefined);
  const page = Number.parseInt(read("page") ?? "1", 10);
  const tablePage = Number.parseInt(read("tablePage") ?? "1", 10);
  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    tablePage: Number.isFinite(tablePage) && tablePage > 0 ? tablePage : 1,
    searchQuery: read("q") ?? "",
    compareA: read("compareA") ?? null,
    compareB: read("compareB") ?? null,
  };
}

export async function loadEnterpriseMultiLocationDashboard(input: {
  workspaceId: string;
  filters: AnalyticsFilters;
  selectedLocationId?: string | null;
  viewState?: MultiLocationDashboard2ViewState;
}): Promise<EnterpriseMultiLocationDashboard> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(input.workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${input.workspaceId}`);
  }

  const snapshot = await loadMultiLocationAnalytics({ userId: ownerUserId }, input.filters);

  const rollup = buildMultiLocationRollup({
    snapshot,
    basePath: "/dashboard/enterprise/multi-location",
  });

  return buildEnterpriseMultiLocationDashboard({
    snapshot,
    rollup,
    filters: input.filters,
    selectedLocationId: input.selectedLocationId,
    viewState: input.viewState,
  });
}

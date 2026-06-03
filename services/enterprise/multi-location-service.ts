import type { AnalyticsFilters } from "@/lib/analytics/filters";
import { buildEnterpriseMultiLocationDashboard } from "@/lib/enterprise/multi-location-builders";
import { buildMultiLocationRollup } from "@/lib/enterprise/multi-location-rollup-builders";
import type { EnterpriseMultiLocationDashboard } from "@/lib/enterprise/multi-location-types";
import { resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { loadMultiLocationAnalytics } from "@/services/analytics/multi-location-analytics";

export type { EnterpriseMultiLocationDashboard } from "@/lib/enterprise/multi-location-types";

export async function loadEnterpriseMultiLocationDashboard(input: {
  workspaceId: string;
  filters: AnalyticsFilters;
  selectedLocationId?: string | null;
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
  });
}

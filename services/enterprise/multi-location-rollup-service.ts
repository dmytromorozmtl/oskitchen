import type { AnalyticsFilters } from "@/lib/analytics/filters";
import {
  buildMultiLocationRollup,
  buildMultiLocationRollupCsv,
} from "@/lib/enterprise/multi-location-rollup-builders";
import type { MultiLocationRollup } from "@/lib/enterprise/multi-location-rollup-types";
import { resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { loadMultiLocationAnalytics } from "@/services/analytics/multi-location-analytics";

export type LoadMultiLocationRollupInput = {
  workspaceId: string;
  filters: AnalyticsFilters;
  basePath?: string;
};

export async function loadMultiLocationRollup(
  input: LoadMultiLocationRollupInput,
): Promise<MultiLocationRollup> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(input.workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${input.workspaceId}`);
  }

  const snapshot = await loadMultiLocationAnalytics({ userId: ownerUserId }, input.filters);
  return buildMultiLocationRollup({
    snapshot,
    basePath: input.basePath ?? "/dashboard/enterprise/multi-location",
  });
}

export async function exportMultiLocationRollupCsv(
  input: LoadMultiLocationRollupInput,
): Promise<{ body: string; filename: string; rowCount: number; rollup: MultiLocationRollup }> {
  const rollup = await loadMultiLocationRollup(input);
  const body = buildMultiLocationRollupCsv(rollup);
  const filename = `multi-location-rollup-${rollup.rangeLabel.replace(/\s+/g, "-")}.csv`;
  return { body, filename, rowCount: rollup.rows.length, rollup };
}

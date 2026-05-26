import { rollupFromCounts, type ObservabilityRollupCounts } from "@/lib/observability/status-types";

import {
  getObservabilityRollupCountsForUser,
  getPlatformObservabilityRollupCounts,
  listPlatformErrorEvents,
  listWorkspaceErrorEvents,
} from "./error-event-service";

export async function loadWorkspaceObservabilityPanel(userId: string) {
  const counts: ObservabilityRollupCounts = await getObservabilityRollupCountsForUser(userId);
  const rollup = rollupFromCounts(counts);
  const events = await listWorkspaceErrorEvents(userId, 12);
  return { counts, rollup, events };
}

export async function loadPlatformObservabilityPanel() {
  const counts: ObservabilityRollupCounts = await getPlatformObservabilityRollupCounts();
  const rollup = rollupFromCounts(counts);
  const events = await listPlatformErrorEvents(40);
  return { counts, rollup, events };
}

export {
  getObservabilityRollupCountsForUser,
  getPlatformObservabilityRollupCounts,
  listPlatformErrorEvents,
  listWorkspaceErrorEvents,
} from "./error-event-service";

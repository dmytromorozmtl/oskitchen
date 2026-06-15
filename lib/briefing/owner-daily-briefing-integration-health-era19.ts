import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotIntegrationHealthStripModel } from "@/lib/integrations/pilot-integration-health-strip-era18";
import { summarizePilotIntegrationLiveProof } from "@/lib/integrations/pilot-integration-health-live-proof-era18";

export const OWNER_DAILY_BRIEFING_INTEGRATION_HEALTH_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-integration-health-v1" as const;

export const OWNER_DAILY_BRIEFING_INTEGRATION_HEALTH_HREF =
  "/dashboard/integration-health" as const;

export type OwnerDailyBriefingIntegrationHealthSlice = {
  healthHref: string;
  overall: PilotIntegrationHealthStripModel["overall"] | "unknown";
  headline: string;
  healthyCount: number;
  degradedCount: number;
  downCount: number;
  failedWebhookCount: number;
  liveProofUrgentCount: number;
  pendingLiveSmokeCount: number;
  channelSmokeOverall: string | null;
  channelSmokeProofStatus: string | null;
  connections: PilotIntegrationHealthStripModel["connections"];
  liveProofRows: PilotIntegrationHealthStripModel["liveProofRows"];
  allClear: boolean;
};

export function resolveIntegrationHealthChannelSmokeFromP0(
  p0Summary: P0StagingProofUnblockSummary | null | undefined,
): { overall: string | null; proofStatus: string | null } {
  if (!p0Summary) {
    return { overall: null, proofStatus: null };
  }

  const child = p0Summary.children.channelLive;
  return {
    overall: child.overall,
    proofStatus: child.proofStatus,
  };
}

export function buildOwnerDailyBriefingIntegrationHealthSlice(input: {
  model: PilotIntegrationHealthStripModel | null;
  p0Summary?: P0StagingProofUnblockSummary | null;
}): OwnerDailyBriefingIntegrationHealthSlice | null {
  if (!input.model) return null;

  const liveProofSummary = summarizePilotIntegrationLiveProof(input.model.liveProofRows);
  const channelSmoke = resolveIntegrationHealthChannelSmokeFromP0(input.p0Summary);

  const hasConnectionIssues =
    input.model.degradedCount > 0 ||
    input.model.downCount > 0 ||
    input.model.failedWebhookCount > 0;
  const hasLiveProofGaps = input.model.liveProofRows.length > 0;
  const channelSmokeBlocked =
    channelSmoke.overall === "SKIPPED" || channelSmoke.overall === "FAILED";

  const allClear =
    input.model.overall === "healthy" &&
    !hasConnectionIssues &&
    !hasLiveProofGaps &&
    !channelSmokeBlocked;

  let headline = input.model.headline;
  if (channelSmoke.overall === "SKIPPED") {
    headline =
      "In-app channels may be ready — engineering live smoke SKIPPED (missing credentials). Not a live PASS claim.";
  } else if (channelSmoke.overall === "FAILED") {
    headline = "Channel live smoke FAILED — fix integrations before scaling pilot orders.";
  }

  return {
    healthHref: OWNER_DAILY_BRIEFING_INTEGRATION_HEALTH_HREF,
    overall: input.model.overall,
    headline,
    healthyCount: input.model.healthyCount,
    degradedCount: input.model.degradedCount,
    downCount: input.model.downCount,
    failedWebhookCount: input.model.failedWebhookCount,
    liveProofUrgentCount: liveProofSummary.urgentCount,
    pendingLiveSmokeCount: liveProofSummary.pendingLiveSmokeCount,
    channelSmokeOverall: channelSmoke.overall,
    channelSmokeProofStatus: channelSmoke.proofStatus,
    connections: input.model.connections,
    liveProofRows: input.model.liveProofRows,
    allClear,
  };
}

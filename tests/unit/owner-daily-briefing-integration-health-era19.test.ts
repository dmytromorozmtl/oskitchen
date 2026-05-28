import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingIntegrationHealthSlice,
  OWNER_DAILY_BRIEFING_INTEGRATION_HEALTH_ERA19_POLICY_ID,
  resolveIntegrationHealthChannelSmokeFromP0,
} from "@/lib/briefing/owner-daily-briefing-integration-health-era19";
import type { PilotIntegrationHealthStripModel } from "@/lib/integrations/pilot-integration-health-strip-era18";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";

const healthyModel: PilotIntegrationHealthStripModel = {
  overall: "healthy",
  headline: "Channels look healthy — review before pilot go-live.",
  healthyCount: 2,
  degradedCount: 0,
  downCount: 0,
  failedWebhookCount: 0,
  connections: [
    {
      id: "c1",
      provider: "WOOCOMMERCE",
      name: "Main store",
      status: "CONNECTED",
      lastSyncLabel: "5m ago",
      hasError: false,
    },
  ],
  liveProofRows: [],
  hasLiveProofAttention: false,
};

const p0SkippedChannel: P0StagingProofUnblockSummary = {
  version: "era17-p0-staging-proof-unblock-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  commitSha: null,
  overall: "SKIPPED",
  p0ProofStatus: "awaiting_ops_credentials",
  defaultProofStatus: "awaiting_ops_credentials",
  allMissingEnvVars: ["DATABASE_URL"],
  children: {
    ssoIdpStaging: {
      smokeScript: "sso",
      artifactPath: "a",
      overall: "SKIPPED",
      proofStatus: null,
      missingEnvVars: [],
    },
    stagingWorkflowsFirstGreen: {
      smokeScript: "wf",
      artifactPath: "b",
      overall: "SKIPPED",
      proofStatus: null,
      missingEnvVars: [],
    },
    channelLive: {
      smokeScript: "channel",
      artifactPath: "c",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: ["DATABASE_URL"],
    },
  },
};

describe("owner daily briefing integration health era19", () => {
  it("locks era19 integration health policy id", () => {
    expect(OWNER_DAILY_BRIEFING_INTEGRATION_HEALTH_ERA19_POLICY_ID).toBe(
      "era19-owner-daily-briefing-integration-health-v1",
    );
  });

  it("reads channel smoke status from P0 artifact", () => {
    expect(resolveIntegrationHealthChannelSmokeFromP0(p0SkippedChannel)).toEqual({
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
    });
  });

  it("builds integration health slice with honest SKIPPED live smoke headline", () => {
    const slice = buildOwnerDailyBriefingIntegrationHealthSlice({
      model: healthyModel,
      p0Summary: p0SkippedChannel,
    });

    expect(slice?.channelSmokeOverall).toBe("SKIPPED");
    expect(slice?.headline).toContain("SKIPPED");
    expect(slice?.headline).toContain("Not a live PASS claim");
    expect(slice?.allClear).toBe(false);
    expect(slice?.healthHref).toBe("/dashboard/integration-health");
  });

  it("returns null when integration model unavailable", () => {
    expect(buildOwnerDailyBriefingIntegrationHealthSlice({ model: null })).toBeNull();
  });

  it("surfaces live proof rows when pilot setup incomplete", () => {
    const slice = buildOwnerDailyBriefingIntegrationHealthSlice({
      model: {
        ...healthyModel,
        liveProofRows: [
          {
            id: "woocommerce-pilot-setup",
            provider: "WOOCOMMERCE",
            label: "WooCommerce",
            statusLabel: "Wizard incomplete",
            detail: "2/5 wizard steps complete.",
            href: "/dashboard/channels/woocommerce",
            tone: "urgent",
          },
        ],
        hasLiveProofAttention: true,
      },
    });

    expect(slice?.liveProofUrgentCount).toBe(1);
    expect(slice?.liveProofRows).toHaveLength(1);
    expect(slice?.allClear).toBe(false);
  });
});

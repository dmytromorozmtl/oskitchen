import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingPilotReadinessSlice,
  countPilotReadinessGoLiveBlockers,
  OWNER_DAILY_BRIEFING_PILOT_READINESS_ERA19_POLICY_ID,
  resolvePilotReadinessSsoLabel,
} from "@/lib/briefing/owner-daily-briefing-pilot-readiness-era19";
import { buildCommercialPilotOpsStatusModel } from "@/lib/commercial/commercial-pilot-ops-status-era18";
import type { ImplementationPilotReadinessModel } from "@/lib/implementation/implementation-pilot-readiness-focus-era18";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";

const basePilotModel: ImplementationPilotReadinessModel = {
  channelLiveProofSlices: [],
  pilotSso: {
    entitlementEnabled: true,
    configured: false,
    active: false,
    workspaceId: "ws-1",
    ssoSetupIncomplete: true,
  },
  goLive: {
    projectId: "proj-1",
    validation: {
      blockers: [{ id: "b1", severity: "CRITICAL", title: "Menu", detail: "Missing" }],
    } as ImplementationPilotReadinessModel["goLive"]["validation"],
    approvalsPending: 0,
  },
};

const goNoGoNoGo: PilotGoNoGoSummary = {
  version: "era17-pilot-gono-go-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  decision: "NO-GO",
  blockers: ["p0_staging_proof"],
  warnings: [],
  customerExecutionStatus: "skipped_missing_customer",
  customerName: null,
  loiSignedDate: null,
  icpQualification: {
    qualified: false,
    reasons: [],
    tier: "unknown",
  },
  evidenceGates: [],
  evaluatorInput: {} as PilotGoNoGoSummary["evaluatorInput"],
};

const p0Skipped: P0StagingProofUnblockSummary = {
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
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: [],
    },
    stagingWorkflowsFirstGreen: {
      smokeScript: "wf",
      artifactPath: "b",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: [],
    },
    channelLive: {
      smokeScript: "channel",
      artifactPath: "c",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: [],
    },
  },
};

describe("owner daily briefing pilot readiness era19", () => {
  it("locks era19 pilot readiness policy id", () => {
    expect(OWNER_DAILY_BRIEFING_PILOT_READINESS_ERA19_POLICY_ID).toBe(
      "era19-owner-daily-briefing-pilot-readiness-v1",
    );
  });

  it("labels SSO setup incomplete when entitled but inactive", () => {
    expect(resolvePilotReadinessSsoLabel(basePilotModel.pilotSso)).toEqual({
      label: "SSO pilot setup incomplete",
      tone: "attention",
    });
  });

  it("counts critical go-live blockers", () => {
    expect(countPilotReadinessGoLiveBlockers(basePilotModel)).toBe(1);
  });

  it("builds pilot readiness slice with commercial NO-GO and P0 blocked", () => {
    const commercialOps = buildCommercialPilotOpsStatusModel({
      goNoGo: { artifactPresent: true, summary: goNoGoNoGo },
      p0Staging: { artifactPresent: true, summary: p0Skipped },
    });

    const slice = buildOwnerDailyBriefingPilotReadinessSlice({
      model: basePilotModel,
      attentionItems: [
        {
          id: "woo-pilot",
          title: "Woo — setup incomplete",
          detail: "2/5 steps",
          href: "/dashboard/channels/woocommerce",
          priority: 3,
          tone: "urgent",
          category: "channel",
        },
      ],
      commercialOps,
    });

    expect(slice.hasUrgent).toBe(true);
    expect(slice.commercialDecisionLabel).toContain("NO-GO");
    expect(slice.p0ProofStatusLabel).toBe("awaiting ops credentials");
    expect(slice.channelIncompleteCount).toBe(1);
    expect(slice.goLiveBlockerCount).toBe(1);
    expect(slice.attentionItems.some((item) => item.id === "commercial-gono-go")).toBe(true);
    expect(slice.attentionItems.some((item) => item.id === "commercial-p0-staging")).toBe(true);
    expect(slice.hubHref).toBe("/dashboard/launch-wizard");
  });

  it("reports all clear when no attention items and no commercial blockers", () => {
    const slice = buildOwnerDailyBriefingPilotReadinessSlice({
      model: {
        ...basePilotModel,
        goLive: { projectId: null, validation: null, approvalsPending: 0 },
        pilotSso: {
          entitlementEnabled: true,
          configured: true,
          active: true,
          workspaceId: "ws-1",
          ssoSetupIncomplete: false,
        },
      },
      attentionItems: [],
      commercialOps: buildCommercialPilotOpsStatusModel({
        goNoGo: {
          artifactPresent: true,
          summary: { ...goNoGoNoGo, decision: "GO", blockers: [] },
        },
        p0Staging: {
          artifactPresent: true,
          summary: { ...p0Skipped, p0ProofStatus: "proof_passed", allMissingEnvVars: [] },
        },
      }),
    });

    expect(slice.allClear).toBe(true);
    expect(slice.commercialDecisionLabel).toBeNull();
    expect(slice.p0ProofStatusLabel).toBeNull();
  });
});

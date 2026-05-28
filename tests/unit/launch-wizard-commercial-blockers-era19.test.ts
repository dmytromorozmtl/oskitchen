import { describe, expect, it } from "vitest";

import { buildP0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import {
  buildLaunchWizardCommercialBlockersSlice,
  launchWizardTodayStripHref,
  resolveLaunchWizardChannelLiveProofBlocked,
  resolveLaunchWizardSsoProofBlocked,
} from "@/lib/launch-wizard/launch-wizard-commercial-blockers-era19";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";

const baseGoNoGo: PilotGoNoGoSummary = {
  version: "era17-pilot-gono-go-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  decision: "NO-GO",
  blockers: ["P0 staging proof blocked", "No paid pilot customer"],
  warnings: [],
  customerExecutionStatus: "skipped_missing_customer",
  customerName: null,
  loiSignedDate: null,
  icpQualification: {
    qualified: false,
    disqualifiers: [],
    missingCriteria: ["Owner engaged in onboarding"],
  },
  evidenceGates: [
    {
      id: "p0_staging",
      label: "P0 staging proof",
      pass: false,
      reason: "awaiting_ops_credentials",
    },
    {
      id: "tier0",
      label: "Tier 0 golden path",
      pass: false,
      reason: "Incomplete locally",
    },
  ],
  evaluatorInput: {
    tier0Pass: false,
    tier1Pass: false,
    tier2Pass: false,
    roleChecklistsComplete: false,
    forbiddenClaimsInContract: false,
    icpQualified: false,
    stagingUrl: null,
    commitSha: null,
  },
};

describe("launch-wizard-commercial-blockers-era19", () => {
  it("flags SSO and channel live proof from P0 child snapshots", () => {
    const p0 = buildP0StagingProofUnblockSummary({
      ssoArtifact: { overall: "SKIPPED", loginProofStatus: "proof_skipped" },
      workflowsArtifact: { overall: "SKIPPED", firstGreenProofStatus: "proof_skipped" },
      channelArtifact: {
        overall: "SKIPPED",
        wooLiveProofStatus: "proof_skipped",
        shopifyLiveProofStatus: "proof_skipped",
      },
    });

    expect(resolveLaunchWizardSsoProofBlocked(p0)).toBe(true);
    expect(resolveLaunchWizardChannelLiveProofBlocked(p0)).toBe(true);
  });

  it("builds commercial blockers for NO-GO with missing customer and P0 blocked", () => {
    const slice = buildLaunchWizardCommercialBlockersSlice({
      commercialOps: {
        loadedAt: "2026-05-28T00:00:00.000Z",
        goNoGo: {
          artifactPresent: true,
          summary: baseGoNoGo,
        },
        p0Staging: {
          artifactPresent: true,
          summary: buildP0StagingProofUnblockSummary({
            ssoArtifact: { overall: "SKIPPED", loginProofStatus: "proof_skipped" },
            workflowsArtifact: { overall: "SKIPPED", firstGreenProofStatus: "proof_skipped" },
            channelArtifact: {
              overall: "SKIPPED",
              wooLiveProofStatus: "proof_skipped",
              shopifyLiveProofStatus: "proof_skipped",
            },
          }),
        },
      },
      p0Blocked: true,
      ssoProofBlocked: true,
      channelLiveProofBlocked: true,
    });

    expect(slice.decision).toBe("NO-GO");
    expect(slice.blockers.some((row) => row.id === "pilot-customer-missing")).toBe(true);
    expect(slice.blockers.some((row) => row.id === "p0-staging-blocked")).toBe(true);
    expect(slice.blockers.some((row) => row.id === "sso-proof-blocked")).toBe(true);
    expect(slice.blockers.some((row) => row.id === "channel-live-proof-blocked")).toBe(true);
    expect(slice.headline).toContain("commercial blocker");
  });

  it("returns clear headline when GO with no blockers", () => {
    const slice = buildLaunchWizardCommercialBlockersSlice({
      commercialOps: {
        loadedAt: "2026-05-28T00:00:00.000Z",
        goNoGo: {
          artifactPresent: true,
          summary: {
            ...baseGoNoGo,
            decision: "GO",
            blockers: [],
            customerExecutionStatus: "recorded",
            evidenceGates: baseGoNoGo.evidenceGates.map((gate) => ({ ...gate, pass: true })),
          },
        },
        p0Staging: { artifactPresent: true, summary: null },
      },
      p0Blocked: false,
      ssoProofBlocked: false,
      channelLiveProofBlocked: false,
    });

    expect(slice.decision).toBe("GO");
    expect(slice.blockers).toHaveLength(0);
    expect(slice.headline).toContain("Commercial evidence gates passed");
  });

  it("builds compact today strip href with optional step anchor", () => {
    expect(launchWizardTodayStripHref(null)).toBe(`${LAUNCH_WIZARD_ROUTE}?mode=compact`);
    expect(launchWizardTodayStripHref("menu-catalog")).toBe(
      `${LAUNCH_WIZARD_ROUTE}?mode=compact#launch-wizard-step-menu-catalog`,
    );
  });
});

import { describe, expect, it } from "vitest";

import type { LaunchBlocker } from "@/lib/go-live/blocker-engine";
import { buildP0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import {
  buildLaunchWizardCommercialBlockersSlice,
} from "@/lib/launch-wizard/launch-wizard-commercial-blockers-era19";
import {
  buildLaunchWizardCommercialSetupSlice,
  mapGoLiveBlockersToCommercialRows,
  mergeLaunchWizardCommercialBlockers,
  pickLaunchWizardNextCommercialUnblock,
} from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19";
import {
  LAUNCH_WIZARD_COMMERCIAL_SETUP_ERA19_POLICY_ID,
} from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

const goLiveBlockers: LaunchBlocker[] = [
  {
    key: "no_active_menu",
    severity: "CRITICAL",
    stage: "CATALOG_SETUP",
    title: "No active menu with products",
    impact: "Customers cannot place orders.",
    resolution: "Create at least one menu and add products before launch.",
    actionRoute: "/dashboard/menus",
  },
];

describe("launch-wizard-commercial-setup-era19", () => {
  it("locks era19 commercial setup policy id", () => {
    expect(LAUNCH_WIZARD_COMMERCIAL_SETUP_ERA19_POLICY_ID).toBe(
      "era19-launch-wizard-commercial-setup-v1",
    );
  });

  it("maps go-live critical blockers into commercial rows", () => {
    const rows = mapGoLiveBlockersToCommercialRows(goLiveBlockers);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe("golive-no_active_menu");
    expect(rows[0]?.href).toBe("/dashboard/menus");
  });

  it("merges commercial and go-live blockers without duplicates", () => {
    const base = buildLaunchWizardCommercialBlockersSlice({
      commercialOps: null,
      p0Blocked: true,
      ssoProofBlocked: false,
      channelLiveProofBlocked: false,
    });
    const merged = mergeLaunchWizardCommercialBlockers({
      baseBlockers: base.blockers,
      goLiveBlockers,
    });

    expect(merged.some((row) => row.id === "p0-staging-blocked")).toBe(true);
    expect(merged.some((row) => row.id === "golive-no_active_menu")).toBe(true);
  });

  it("prioritizes GO/NO-GO and P0 before go-live blockers for next unblock", () => {
    const base = buildLaunchWizardCommercialBlockersSlice({
      commercialOps: {
        loadedAt: "2026-05-28T00:00:00.000Z",
        goNoGo: {
          artifactPresent: true,
          summary: {
            version: "era17-pilot-gono-go-v1",
            runAt: "2026-05-28T00:00:00.000Z",
            decision: "NO-GO",
            blockers: ["P0 blocked"],
            warnings: [],
            customerExecutionStatus: "skipped_missing_customer",
            customerName: null,
            loiSignedDate: null,
            icpQualification: { qualified: false, disqualifiers: [], missingCriteria: [] },
            evidenceGates: [],
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
          },
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
    const merged = mergeLaunchWizardCommercialBlockers({
      baseBlockers: base.blockers,
      goLiveBlockers,
    });
    const next = pickLaunchWizardNextCommercialUnblock(merged);

    expect(next?.blockerId).toBe("gono-go-no-go");
  });

  it("links P0 and channel blockers to integration recovery checklist", () => {
    const base = buildLaunchWizardCommercialBlockersSlice({
      commercialOps: {
        loadedAt: "2026-05-28T00:00:00.000Z",
        goNoGo: { artifactPresent: false, summary: null },
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
      ssoProofBlocked: false,
      channelLiveProofBlocked: true,
    });
    const merged = mergeLaunchWizardCommercialBlockers({ baseBlockers: base.blockers, goLiveBlockers: [] });
    const p0 = merged.find((row) => row.id === "p0-staging-blocked");
    const channel = merged.find((row) => row.id === "channel-live-proof-blocked");

    expect(p0?.href).toContain("integration-recovery-checklist");
    expect(channel?.href).toContain("integration-recovery-checklist");
  });

  it("builds setup slice with recovery links and next unblock", () => {
    const base = buildLaunchWizardCommercialBlockersSlice({
      commercialOps: null,
      p0Blocked: true,
      ssoProofBlocked: false,
      channelLiveProofBlocked: false,
    });
    const setup = buildLaunchWizardCommercialSetupSlice({ blockers: base.blockers });

    expect(setup.nextUnblock).not.toBeNull();
    expect(setup.recoveryLinks.length).toBeGreaterThanOrEqual(4);
    expect(setup.recoveryLinks.some((link) => link.id === "today-risk-radar")).toBe(true);
  });
});

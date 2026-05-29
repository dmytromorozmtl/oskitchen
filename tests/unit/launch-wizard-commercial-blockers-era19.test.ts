import { describe, expect, it } from "vitest";

import { buildP0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import {
  buildLaunchWizardCommercialBlockersSlice,
  launchWizardTodayStripHref,
  resolveLaunchWizardChannelLiveProofBlocked,
  resolveLaunchWizardSsoProofBlocked,
} from "@/lib/launch-wizard/launch-wizard-commercial-blockers-era19";
import { buildLaunchWizardCommercialSetupSlice } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19";
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

const emptyVaultSlice = {
  artifactPresent: false,
  report: null,
} as const;

const emptyTier2Slice = {
  artifactPresent: false,
  summary: null,
} as const;

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
        tier2Staging: emptyTier2Slice,
        vaultReadiness: emptyVaultSlice,
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
        tier2Staging: emptyTier2Slice,
        vaultReadiness: emptyVaultSlice,
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

  it("uses vault report next phase for P0 blocker and commercial setup nextUnblock", () => {
    const p0Summary = buildP0StagingProofUnblockSummary({
      ssoArtifact: { overall: "SKIPPED", loginProofStatus: "proof_skipped" },
      workflowsArtifact: { overall: "SKIPPED", firstGreenProofStatus: "proof_skipped" },
      channelArtifact: {
        overall: "SKIPPED",
        wooLiveProofStatus: "proof_skipped",
        shopifyLiveProofStatus: "proof_skipped",
      },
    });
    const slice = buildLaunchWizardCommercialBlockersSlice({
      commercialOps: {
        loadedAt: "2026-05-28T00:00:00.000Z",
        goNoGo: { artifactPresent: false, summary: null },
        p0Staging: { artifactPresent: true, summary: p0Summary },
        tier2Staging: emptyTier2Slice,
        vaultReadiness: {
          artifactPresent: true,
          report: {
            version: "vault-readiness-v2",
            generatedAt: "2026-05-28T00:00:00.000Z",
            policyId: "era17-p0-staging-proof-unblock-v1",
            opsChecklistDoc: "docs/era18-p0-staging-proof-ops-checklist.md",
            vaultMatrixDoc: "docs/ops-vault-matrix.md",
            vaultReady: false,
            presentCount: 0,
            totalCount: 11,
            missingKeys: [
              "E2E_STAGING_BASE_URL",
              "E2E_LOGIN_EMAIL",
              "E2E_LOGIN_PASSWORD",
            ],
            day0Milestone: "blocked",
            day0PartialComplete: false,
            p0ProofStatus: "awaiting_ops_credentials",
            p0ArtifactOverall: "SKIPPED",
            nextPhase: {
              id: "staging_login",
              label: "Phase 1 — Staging login",
              complete: false,
              presentKeys: [],
              missingKeys: ["E2E_STAGING_BASE_URL", "E2E_LOGIN_EMAIL", "E2E_LOGIN_PASSWORD"],
              docPath: "docs/GITHUB_E2E_STAGING_SECRETS.md",
              smokeScripts: ["smoke:staging-workflows-first-green"],
            },
            phases: [],
            childSmokes: [],
            recommendedNextSteps: [],
            secrets: [],
            honestyNote: "test",
          },
        },
      },
      p0Blocked: true,
      ssoProofBlocked: true,
      channelLiveProofBlocked: true,
    });

    const p0Blocker = slice.blockers.find((row) => row.id === "p0-staging-blocked");
    expect(p0Blocker?.label).toContain("Staging login");
    expect(p0Blocker?.detail).toContain("GITHUB_E2E_STAGING_SECRETS.md");
    expect(p0Blocker?.href).toContain("commercial-pilot-ops");

    const setup = buildLaunchWizardCommercialSetupSlice({ blockers: slice.blockers });
    expect(setup.nextUnblock?.blockerId).toBe("p0-staging-blocked");
    expect(setup.nextUnblock?.detail).toContain("E2E_LOGIN_EMAIL");
    expect(setup.nextUnblock?.href).toContain("commercial-pilot-ops");
  });
});

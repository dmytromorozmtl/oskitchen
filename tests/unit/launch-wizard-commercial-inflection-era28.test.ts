import { describe, expect, it } from "vitest";

import { buildP0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import {
  buildLaunchWizardCommercialInflectionSlice,
  buildLaunchWizardCommercialInflectionSliceFromCommercialOps,
  LAUNCH_WIZARD_COMMERCIAL_INFLECTION_ERA28_POLICY_ID,
} from "@/lib/launch-wizard/launch-wizard-commercial-inflection-era28";
import { buildLaunchWizardTodayStripViewModel } from "@/lib/launch-wizard/launch-wizard-today-strip-era19";

describe("launch-wizard-commercial-inflection-era28", () => {
  it("builds slice with integrity validate command", () => {
    const slice = buildLaunchWizardCommercialInflectionSlice();
    expect(slice?.policyId).toBe(LAUNCH_WIZARD_COMMERCIAL_INFLECTION_ERA28_POLICY_ID);
    expect(slice?.integrityValidateCommand).toContain("validate-p0-staging-proof-integrity");
    expect(slice?.goIntegrityValidateCommand).toContain("validate-pilot-gono-go-integrity");
    expect(slice?.platformOpsHref).toContain("commercial-inflection-readiness");
  });

  it("builds vault-aware slice from commercial ops model", () => {
    const p0Summary = buildP0StagingProofUnblockSummary({
      ssoArtifact: { overall: "SKIPPED", loginProofStatus: "proof_skipped" },
      workflowsArtifact: { overall: "SKIPPED", firstGreenProofStatus: "proof_skipped" },
      channelArtifact: {
        overall: "SKIPPED",
        wooLiveProofStatus: "proof_skipped",
        shopifyLiveProofStatus: "proof_skipped",
      },
    });
    const slice = buildLaunchWizardCommercialInflectionSliceFromCommercialOps({
      loadedAt: "2026-05-28T00:00:00.000Z",
      goNoGo: { artifactPresent: false, summary: null },
      p0Staging: { artifactPresent: true, summary: p0Summary },
      tier2Staging: { artifactPresent: false, summary: null },
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
          missingKeys: ["E2E_STAGING_BASE_URL", "E2E_LOGIN_EMAIL", "E2E_LOGIN_PASSWORD"],
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
    });
    expect(slice?.platformOpsHref).toContain("#p0-staging-proof");
    expect(slice?.topBlockerTitle).toContain("Staging login");
  });

  it("wires inflection into today strip view model", () => {
    const inflection = buildLaunchWizardCommercialInflectionSlice();
    expect(inflection).not.toBeNull();
    if (!inflection) return;

    const view = buildLaunchWizardTodayStripViewModel({
      commercialBlockers: {
        decision: "NO-GO",
        decisionLabel: "NO-GO",
        artifactPresent: false,
        customerExecutionStatus: null,
        blockers: [],
        headline: "Blocked",
      },
      commercialSetup: {
        policyId: "era19-launch-wizard-commercial-setup-v1",
        nextUnblock: null,
        recoveryLinks: [],
      },
      commercialInflection: inflection,
      nextStep: null,
      progress: { completedCount: 1, totalCount: 5, percent: 20 },
    });

    expect(view.commercialInflection?.milestoneLabel).toContain("p0");
    expect(view.subline).toContain("Pilot");
  });
});

import { describe, expect, it } from "vitest";

import { buildP0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import {
  buildCommercialPilotOpsInflectionSlice,
  COMMERCIAL_PILOT_OPS_INFLECTION_ERA28_POLICY_ID,
} from "@/lib/commercial/commercial-pilot-ops-inflection-era28";

describe("commercial-pilot-ops-inflection-era28", () => {
  it("builds vault-aware inflection slice from commercial ops model", () => {
    const p0Summary = buildP0StagingProofUnblockSummary({
      ssoArtifact: { overall: "SKIPPED", loginProofStatus: "proof_skipped" },
      workflowsArtifact: { overall: "SKIPPED", firstGreenProofStatus: "proof_skipped" },
      channelArtifact: {
        overall: "SKIPPED",
        wooLiveProofStatus: "proof_skipped",
        shopifyLiveProofStatus: "proof_skipped",
      },
    });
    const slice = buildCommercialPilotOpsInflectionSlice({
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

    expect(slice.policyId).toBe(COMMERCIAL_PILOT_OPS_INFLECTION_ERA28_POLICY_ID);
    expect(slice.summary.milestone).toBe("p0_ops_vault_blocked");
    expect(slice.summary.p0VaultMissingCount).toBe(3);
    expect(slice.uiSlice?.platformOpsHref).toContain("#p0-staging-proof");
    expect(slice.uiSlice?.topBlockerTitle).toContain("Staging login");
    expect(slice.vaultHero?.nextPhase?.label).toContain("Staging login");
    const vaultBlocker = slice.summary.blockers.find((row) => row.id === "p0_ops_vault_11_env");
    expect(vaultBlocker?.title).toContain("Staging login");
    expect(vaultBlocker?.detail).toContain("GITHUB_E2E_STAGING_SECRETS.md");
  });

  it("falls back to live env when vault report absent", () => {
    const p0Summary = buildP0StagingProofUnblockSummary({
      ssoArtifact: { overall: "SKIPPED", loginProofStatus: "proof_skipped" },
      workflowsArtifact: { overall: "SKIPPED", firstGreenProofStatus: "proof_skipped" },
      channelArtifact: {
        overall: "SKIPPED",
        wooLiveProofStatus: "proof_skipped",
        shopifyLiveProofStatus: "proof_skipped",
      },
    });
    const slice = buildCommercialPilotOpsInflectionSlice({
      loadedAt: "2026-05-28T00:00:00.000Z",
      goNoGo: { artifactPresent: false, summary: null },
      p0Staging: { artifactPresent: true, summary: p0Summary },
      tier2Staging: { artifactPresent: false, summary: null },
      vaultReadiness: { artifactPresent: false, report: null },
    });

    expect(slice.summary.milestone).toBe("p0_ops_vault_blocked");
    expect(slice.summary.p0VaultMissingCount).toBe(11);
    expect(slice.vaultHero?.blocked).toBe(true);
    expect(slice.uiSlice?.platformOpsHref).toContain("#p0-staging-proof");
  });
});

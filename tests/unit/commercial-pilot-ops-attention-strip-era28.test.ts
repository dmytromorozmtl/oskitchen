import { describe, expect, it } from "vitest";

import { buildP0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import { buildCommercialPilotOpsStatusModel } from "@/lib/commercial/commercial-pilot-ops-status-era18";
import { buildCommercialPilotOpsInflectionSlice } from "@/lib/commercial/commercial-pilot-ops-inflection-era28";

describe("commercial-pilot-ops-attention-strip vault context", () => {
  it("inflection slice exposes vault hero for attention strip description", () => {
    const p0Summary = buildP0StagingProofUnblockSummary({
      ssoArtifact: { overall: "SKIPPED", loginProofStatus: "proof_skipped" },
      workflowsArtifact: { overall: "SKIPPED", firstGreenProofStatus: "proof_skipped" },
      channelArtifact: {
        overall: "SKIPPED",
        wooLiveProofStatus: "proof_skipped",
        shopifyLiveProofStatus: "proof_skipped",
      },
    });
    const model = buildCommercialPilotOpsStatusModel({
      goNoGo: { artifactPresent: false, summary: null },
      p0Staging: { artifactPresent: true, summary: p0Summary },
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
    const inflection = buildCommercialPilotOpsInflectionSlice(model);
    expect(inflection.summary.milestone).toBe("p0_ops_vault_blocked");
    expect(inflection.vaultHero?.nextPhase?.label).toContain("Staging login");
    expect(inflection.uiSlice?.topBlockerTitle).toContain("Staging login");
    expect(inflection.summary.p0VaultMissingCount).toBe(3);
  });
});

import { describe, expect, it } from "vitest";

import { buildP0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import {
  buildCommercialInflectionReadinessUiSlice,
  COMMERCIAL_INFLECTION_READINESS_UI_ERA28_POLICY_ID,
  formatCommercialInflectionScorecardLabel,
} from "@/lib/commercial/commercial-inflection-readiness-ui-era28";
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";
import { LIVE_INTEGRATION_REGISTRY_LIVE_COUNT } from "@/lib/integrations/live-integration-dod-smoke-era17-policy";

describe("commercial-inflection-readiness-ui-era28", () => {
  it("builds blocked slice locally with honest registry LIVE counts", () => {
    const summary = evaluateCommercialInflectionReadiness({});
    const slice = buildCommercialInflectionReadinessUiSlice(summary);
    expect(slice?.policyId).toBe(COMMERCIAL_INFLECTION_READINESS_UI_ERA28_POLICY_ID);
    expect(slice?.milestone).toBe("p0_ops_vault_blocked");
    expect(slice?.p0VaultMissingCount).toBe(11);
    expect(slice?.integrationRegistryLiveCount).toBe(LIVE_INTEGRATION_REGISTRY_LIVE_COUNT);
    expect(slice?.platformOpsHref).toContain("#commercial-inflection-readiness");
    expect(slice?.integrationHealthHref).toContain("#integration-health-commercial-inflection");
  });

  it("routes platform ops href to p0-staging-proof when vault report phases P0 blocked", () => {
    const p0Staging = buildP0StagingProofUnblockSummary({
      ssoArtifact: { overall: "SKIPPED", loginProofStatus: "proof_skipped" },
      workflowsArtifact: { overall: "SKIPPED", firstGreenProofStatus: "proof_skipped" },
      channelArtifact: {
        overall: "SKIPPED",
        wooLiveProofStatus: "proof_skipped",
        shopifyLiveProofStatus: "proof_skipped",
      },
    });
    const vaultReport = {
      version: "vault-readiness-v2" as const,
      generatedAt: "2026-05-28T00:00:00.000Z",
      policyId: "era17-p0-staging-proof-unblock-v1" as const,
      opsChecklistDoc: "docs/era18-p0-staging-proof-ops-checklist.md" as const,
      vaultMatrixDoc: "docs/ops-vault-matrix.md" as const,
      vaultReady: false,
      presentCount: 0,
      totalCount: 11,
      missingKeys: ["E2E_STAGING_BASE_URL", "E2E_LOGIN_EMAIL", "E2E_LOGIN_PASSWORD"],
      day0Milestone: "blocked" as const,
      day0PartialComplete: false,
      p0ProofStatus: "awaiting_ops_credentials",
      p0ArtifactOverall: "SKIPPED",
      nextPhase: {
        id: "staging_login" as const,
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
    };
    const summary = evaluateCommercialInflectionReadiness({}, process.cwd(), {
      p0Staging,
      vaultReport,
    });
    const slice = buildCommercialInflectionReadinessUiSlice(summary, {
      vaultReport,
      p0Staging,
    });
    expect(slice?.platformOpsHref).toContain("#p0-staging-proof");
    expect(slice?.topBlockerTitle).toContain("Staging login");
  });

  it("formats scorecard label", () => {
    const slice = buildCommercialInflectionReadinessUiSlice();
    expect(slice).not.toBeNull();
    if (!slice) return;
    expect(formatCommercialInflectionScorecardLabel(slice)).toContain("Pilot");
    expect(formatCommercialInflectionScorecardLabel(slice)).toContain("Governance");
  });
});

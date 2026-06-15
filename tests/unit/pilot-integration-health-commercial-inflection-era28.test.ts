import { describe, expect, it } from "vitest";

import { buildP0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";
import { buildCommercialInflectionReadinessUiSlice } from "@/lib/commercial/commercial-inflection-readiness-ui-era28";
import { augmentPilotIntegrationHealthStripWithCommercialInflection } from "@/lib/integrations/pilot-integration-health-commercial-inflection-era28";
import { buildPilotIntegrationHealthStripModel } from "@/lib/integrations/pilot-integration-health-strip-era18";

describe("pilot-integration-health-commercial-inflection-era28", () => {
  it("augments strip headline with registry honesty", () => {
    const base = buildPilotIntegrationHealthStripModel({
      summary: {
        overall: "healthy",
        healthyCount: 1,
        degradedCount: 0,
        downCount: 0,
      },
      cards: [],
      failedWebhookCount: 0,
    });
    const augmented = augmentPilotIntegrationHealthStripWithCommercialInflection(
      base,
      buildCommercialInflectionReadinessUiSlice(),
    );
    expect(augmented.commercialInflection).not.toBeNull();
    expect(augmented.headline).toContain("Registry LIVE");
  });

  it("augments headline with vault phased blocker when vault report present", () => {
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
    const vaultAwareSlice = buildCommercialInflectionReadinessUiSlice(
      evaluateCommercialInflectionReadiness({}, process.cwd(), { p0Staging, vaultReport }),
      { vaultReport, p0Staging },
    );
    const base = buildPilotIntegrationHealthStripModel({
      summary: {
        overall: "healthy",
        healthyCount: 1,
        degradedCount: 0,
        downCount: 0,
      },
      cards: [],
      failedWebhookCount: 0,
    });
    const augmented = augmentPilotIntegrationHealthStripWithCommercialInflection(
      base,
      vaultAwareSlice,
    );
    expect(augmented.headline).toContain("Market inflection blocked");
    expect(augmented.headline).toContain("3/11 vault");
    expect(augmented.commercialInflection?.platformOpsHref).toContain("#p0-staging-proof");
    expect(augmented.commercialInflection?.topBlockerTitle).toContain("Staging login");
  });
});

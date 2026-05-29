import { describe, expect, it } from "vitest";

import { buildP0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import { buildIntegrationHealthCommercialInflectionBanner } from "@/lib/integrations/integration-health-commercial-inflection-era28";
import { enrichIntegrationHealthChannelCardsWithTrustLayer } from "@/lib/integrations/integration-health-trust-layer-era20";
describe("integration-health-commercial-inflection-era28", () => {
  it("builds banner with registry honesty line", () => {
    const banner = buildIntegrationHealthCommercialInflectionBanner();
    expect(banner?.milestone).toBe("p0_ops_vault_blocked");
    expect(banner?.registryHonestyLine).toContain("LIVE=0");
    expect(banner?.nextActions[0]?.href).toContain("commercial-inflection-readiness");
  });

  it("uses vault report phased headline and platform ops href", () => {
    const p0Staging = buildP0StagingProofUnblockSummary({
      ssoArtifact: { overall: "SKIPPED", loginProofStatus: "proof_skipped" },
      workflowsArtifact: { overall: "SKIPPED", firstGreenProofStatus: "proof_skipped" },
      channelArtifact: {
        overall: "SKIPPED",
        wooLiveProofStatus: "proof_skipped",
        shopifyLiveProofStatus: "proof_skipped",
      },
    });
    const banner = buildIntegrationHealthCommercialInflectionBanner({
      p0Staging,
      vaultReport: {
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
    });
    expect(banner?.headline).toContain("Staging login");
    expect(banner?.inflection.platformOpsHref).toContain("#p0-staging-proof");
  });

  it("enriches trust layer with commercial inflection slice", () => {
    const enriched = enrichIntegrationHealthChannelCardsWithTrustLayer(
      {
        policyId: "era19-integration-health-channel-cards-v1",
        loadedAt: "2026-05-28T00:00:00.000Z",
        headline: "Test headline",
        cards: [],
      },
      null,
    );
    expect(enriched.commercialInflection).not.toBeNull();
    expect(enriched.headline).toContain("Market inflection blocked");
  });
});

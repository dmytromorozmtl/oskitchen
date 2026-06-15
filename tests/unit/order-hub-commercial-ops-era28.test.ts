import { describe, expect, it } from "vitest";

import { buildP0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import { buildCommercialPilotOpsStatusModel } from "@/lib/commercial/commercial-pilot-ops-status-era18";
import {
  buildOrderHubCommercialOpsStripSlice,
  ORDER_HUB_COMMERCIAL_OPS_ERA28_POLICY_ID,
} from "@/lib/order-hub/order-hub-commercial-ops-era28";

describe("order-hub-commercial-ops-era28", () => {
  it("returns null when commercial ops unavailable", () => {
    expect(buildOrderHubCommercialOpsStripSlice(null)).toBeNull();
  });

  it("builds vault phased strip for channel order operators", () => {
    const p0Summary = buildP0StagingProofUnblockSummary({
      ssoArtifact: { overall: "SKIPPED", loginProofStatus: "proof_skipped" },
      workflowsArtifact: { overall: "SKIPPED", firstGreenProofStatus: "proof_skipped" },
      channelArtifact: {
        overall: "SKIPPED",
        wooLiveProofStatus: "proof_skipped",
        shopifyLiveProofStatus: "proof_skipped",
      },
    });
    const slice = buildOrderHubCommercialOpsStripSlice(
      buildCommercialPilotOpsStatusModel({
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
      }),
    );

    expect(slice?.policyId).toBe(ORDER_HUB_COMMERCIAL_OPS_ERA28_POLICY_ID);
    expect(slice?.headline).toContain("Staging login");
    expect(slice?.headline).toContain("Channel orders blocked");
    expect(slice?.vaultMissingCount).toBe(3);
    expect(slice?.platformOpsHref).toContain("#p0-staging-proof");
    expect(slice?.integrationHealthHref).toContain("integration-health");
    expect(slice?.channelLiveProofBlocked).toBe(true);
    expect(slice?.missingKeys).toEqual([
      "E2E_STAGING_BASE_URL",
      "E2E_LOGIN_EMAIL",
      "E2E_LOGIN_PASSWORD",
    ]);
    expect(slice?.docPath).toBe("docs/GITHUB_E2E_STAGING_SECRETS.md");
  });
});

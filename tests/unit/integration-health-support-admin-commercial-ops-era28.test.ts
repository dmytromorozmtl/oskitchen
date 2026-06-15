import { describe, expect, it } from "vitest";

import { buildP0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import { buildCommercialPilotOpsStatusModel } from "@/lib/commercial/commercial-pilot-ops-status-era18";
import {
  buildIntegrationHealthSupportAdminVaultOpsSlice,
  INTEGRATION_HEALTH_SUPPORT_ADMIN_COMMERCIAL_OPS_ERA28_POLICY_ID,
} from "@/lib/integrations/integration-health-support-admin-commercial-ops-era28";
import { buildIntegrationHealthSupportAdminModel } from "@/lib/integrations/integration-health-support-admin-era19";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import {
  buildIntegrationHealthChannelCardsModel,
} from "@/lib/integrations/integration-health-channel-cards-era19";
import {
  buildIntegrationHealthSmokeArtifactsModel,
} from "@/lib/integrations/integration-health-smoke-artifacts-era19";

const goNoGo: PilotGoNoGoSummary = {
  version: "era17-pilot-gono-go-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  decision: "NO-GO",
  blockers: ["P0 staging proof blocked"],
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
};

describe("integration-health-support-admin-commercial-ops-era28", () => {
  it("returns null when commercial ops unavailable", () => {
    expect(buildIntegrationHealthSupportAdminVaultOpsSlice(null)).toBeNull();
  });

  it("builds vault phased slice for support admin triage", () => {
    const p0Summary = buildP0StagingProofUnblockSummary({
      ssoArtifact: { overall: "SKIPPED", loginProofStatus: "proof_skipped" },
      workflowsArtifact: { overall: "SKIPPED", firstGreenProofStatus: "proof_skipped" },
      channelArtifact: {
        overall: "SKIPPED",
        wooLiveProofStatus: "proof_skipped",
        shopifyLiveProofStatus: "proof_skipped",
      },
    });
    const commercialOps = buildCommercialPilotOpsStatusModel({
      goNoGo: { artifactPresent: true, summary: goNoGo },
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
            docPath: "docs/staging-environment-setup.md",
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

    const slice = buildIntegrationHealthSupportAdminVaultOpsSlice(commercialOps);

    expect(slice?.policyId).toBe(INTEGRATION_HEALTH_SUPPORT_ADMIN_COMMERCIAL_OPS_ERA28_POLICY_ID);
    expect(slice?.headline).toContain("Support triage");
    expect(slice?.headline).toContain("Staging login");
    expect(slice?.vaultMissingCount).toBe(3);
    expect(slice?.platformOpsHref).toContain("#p0-staging-proof");
    expect(slice?.channelLiveProofBlocked).toBe(true);
    expect(slice?.ssoProofBlocked).toBe(true);
    expect(slice?.missingKeys).toEqual([
      "E2E_STAGING_BASE_URL",
      "E2E_LOGIN_EMAIL",
      "E2E_LOGIN_PASSWORD",
    ]);
    expect(slice?.docPath).toBe("docs/staging-environment-setup.md");
  });

  it("wires vault phased headline into support admin model", () => {
    const p0Summary = buildP0StagingProofUnblockSummary({
      ssoArtifact: { overall: "SKIPPED", loginProofStatus: "proof_skipped" },
      workflowsArtifact: { overall: "SKIPPED", firstGreenProofStatus: "proof_skipped" },
      channelArtifact: {
        overall: "SKIPPED",
        wooLiveProofStatus: "proof_skipped",
        shopifyLiveProofStatus: "proof_skipped",
      },
    });
    const commercialOps = buildCommercialPilotOpsStatusModel({
      goNoGo: { artifactPresent: true, summary: goNoGo },
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
            docPath: "docs/staging-environment-setup.md",
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
    const channelCards = buildIntegrationHealthChannelCardsModel({
      stripeConfigured: false,
      stripeMissingEnvVars: [],
      failedWebhookCount: 0,
      apiKeysActive: 0,
      channelSmoke: null,
      p0Staging: p0Summary,
      cards: [],
      liveProofSlices: [],
      sso: { entitlementEnabled: false, configured: false, active: false },
    });
    const smokeArtifacts = buildIntegrationHealthSmokeArtifactsModel({
      channelLive: null,
      p0Staging: p0Summary,
      stagingWorkflows: null,
    });

    const model = buildIntegrationHealthSupportAdminModel({
      visible: true,
      mode: "platform",
      workspaceId: "ws-1",
      businessName: "Test Kitchen",
      connectionCount: 0,
      errorConnectionCount: 0,
      failedWebhookCount: 0,
      commercialOps,
      channelCards,
      smokeArtifacts,
    });

    expect(model.vaultOpsSlice?.vaultPhaseLabel).toBe("Phase 1 — Staging login");
    expect(model.headline).toContain("Support triage");
    expect(model.headline).toContain("Staging login");
  });
});

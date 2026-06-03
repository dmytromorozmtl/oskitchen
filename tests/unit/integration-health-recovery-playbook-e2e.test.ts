import { describe, expect, it } from "vitest";

import { getRecoveryPlaybookForAlert } from "@/lib/integration-health/recovery-playbook-policy";
import {
  INTEGRATION_HEALTH_PATH,
  INTEGRATION_HEALTH_RECOVERY_PLAYBOOK_E2E_POLICY_ID,
  INTEGRATION_HEALTH_RECOVERY_URL,
  RECOVERY_QUICK_LINK_HREFS,
  integrationHealthRecoveryQuickLinkTestId,
  isAllowedRecoveryDestinationHref,
} from "@/lib/integration-health/integration-health-recovery-playbook-e2e-policy";
import { buildIntegrationHealthChannelCardsModel } from "@/lib/integrations/integration-health-channel-cards-era19";
import { buildIntegrationHealthSmokeArtifactsModel } from "@/lib/integrations/integration-health-smoke-artifacts-era19";
import { buildIntegrationHealthRecoveryModel } from "@/lib/integrations/integration-health-recovery-era19";
import type { ChannelLiveSmokeSummary } from "@/lib/integrations/channel-live-smoke-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { StagingWorkflowFirstGreenSummary } from "@/lib/ci/staging-workflows-first-green-summary";

const channelSkipped: ChannelLiveSmokeSummary = {
  version: "era17-channel-live-smoke-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  overall: "SKIPPED",
  wooLiveProofStatus: "proof_skipped_missing_prerequisites",
  shopifyLiveProofStatus: "proof_skipped_missing_prerequisites",
  missingEnvVars: ["DATABASE_URL"],
  steps: [],
};

const stagingSkipped: StagingWorkflowFirstGreenSummary = {
  version: "era17-staging-workflows-first-green-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  overall: "SKIPPED",
  wiringCertPassed: true,
  stagingSecretsConfigured: false,
  stagingHealthChecked: false,
  firstGreenProofStatus: "proof_skipped_missing_prerequisites",
  missingEnvVars: [],
  githubRuns: [],
  githubPassedCount: 0,
  steps: [],
};

const p0Skipped: P0StagingProofUnblockSummary = {
  version: "era17-p0-staging-proof-unblock-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  commitSha: null,
  overall: "SKIPPED",
  p0ProofStatus: "awaiting_ops_credentials",
  defaultProofStatus: "awaiting_ops_credentials",
  allMissingEnvVars: ["DATABASE_URL"],
  children: {
    ssoIdpStaging: {
      smokeScript: "smoke:enterprise-sso-idp-staging",
      artifactPath: "artifacts/enterprise-sso-idp-staging-smoke-summary.json",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: [],
    },
    stagingWorkflowsFirstGreen: {
      smokeScript: "smoke:staging-workflows-first-green",
      artifactPath: "artifacts/staging-workflows-first-green-summary.json",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: [],
    },
    channelLive: {
      smokeScript: "smoke:woo-shopify-live",
      artifactPath: "artifacts/channel-live-smoke-summary.json",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: [],
    },
  },
};

describe("Integration health recovery playbook E2E lifecycle (QA-21)", () => {
  it("exports health center recovery URL and policy id", () => {
    expect(INTEGRATION_HEALTH_RECOVERY_PLAYBOOK_E2E_POLICY_ID).toBe(
      "integration-health-recovery-playbook-e2e-v1",
    );
    expect(INTEGRATION_HEALTH_PATH).toBe("/dashboard/integration-health");
    expect(INTEGRATION_HEALTH_RECOVERY_URL).toContain("#integration-recovery-checklist");
  });

  it("builds recovery model with quick links when no channel blockers", () => {
    const channelCards = buildIntegrationHealthChannelCardsModel({
      stripeConfigured: false,
      stripeMissingEnvVars: ["STRIPE_SECRET_KEY"],
      failedWebhookCount: 0,
      apiKeysActive: 0,
      channelSmoke: channelSkipped,
      p0Staging: p0Skipped,
      cards: [],
      liveProofSlices: [],
      sso: null,
    });
    const smokeArtifacts = buildIntegrationHealthSmokeArtifactsModel({
      channelLive: channelSkipped,
      p0Staging: p0Skipped,
      stagingWorkflows: stagingSkipped,
    });
    const model = buildIntegrationHealthRecoveryModel({ channelCards, smokeArtifacts });

    expect(model.quickLinks.length).toBeGreaterThan(0);
    expect(model.steps.length).toBeGreaterThanOrEqual(0);
    for (const link of model.quickLinks) {
      expect(isAllowedRecoveryDestinationHref(link.href)).toBe(true);
      expect(integrationHealthRecoveryQuickLinkTestId(link.id)).toContain(link.id);
    }
  });

  it("sync_stale playbook includes inventory auto recovery", () => {
    const playbook = getRecoveryPlaybookForAlert("sync_stale");
    expect(playbook?.steps.some((step) => step.autoAction === "pull_inventory_sync")).toBe(true);
    expect(
      playbook?.steps.some(
        (step) => step.href && RECOVERY_QUICK_LINK_HREFS.includes(step.href),
      ),
    ).toBe(true);
  });

  it("auth_degraded playbook routes to sales channels credential fix", () => {
    const playbook = getRecoveryPlaybookForAlert("auth_degraded");
    expect(playbook?.steps.some((step) => step.href === "/dashboard/sales-channels")).toBe(true);
  });
});

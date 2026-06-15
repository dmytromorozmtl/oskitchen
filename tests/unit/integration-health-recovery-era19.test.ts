import { describe, expect, it } from "vitest";

import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { StagingWorkflowFirstGreenSummary } from "@/lib/ci/staging-workflows-first-green-summary";
import type { ChannelLiveSmokeSummary } from "@/lib/integrations/channel-live-smoke-summary";
import { buildIntegrationHealthChannelCardsModel } from "@/lib/integrations/integration-health-channel-cards-era19";
import { buildIntegrationHealthSmokeArtifactsModel } from "@/lib/integrations/integration-health-smoke-artifacts-era19";
import {
  INTEGRATION_HEALTH_RECOVERY_ERA19_POLICY_ID,
  INTEGRATION_HEALTH_RECOVERY_QUICK_LINKS,
} from "@/lib/integrations/integration-health-recovery-era19-policy";
import {
  buildIntegrationHealthRecoveryModel,
  buildIntegrationHealthRecoverySteps,
  summarizeIntegrationHealthRecovery,
} from "@/lib/integrations/integration-health-recovery-era19";

const channelSkipped: ChannelLiveSmokeSummary = {
  version: "era17-channel-live-smoke-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  overall: "SKIPPED",
  wooLiveProofStatus: "proof_skipped_missing_prerequisites",
  shopifyLiveProofStatus: "proof_skipped_missing_prerequisites",
  missingEnvVars: ["DATABASE_URL", "CHANNEL_SMOKE_OWNER_EMAIL"],
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
  missingEnvVars: ["E2E_STAGING_BASE_URL"],
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
  allMissingEnvVars: ["DATABASE_URL", "E2E_STAGING_BASE_URL"],
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

function buildFixtures(input?: { failedWebhookCount?: number }) {
  const channelCards = buildIntegrationHealthChannelCardsModel({
    stripeConfigured: false,
    stripeMissingEnvVars: ["STRIPE_SECRET_KEY"],
    failedWebhookCount: input?.failedWebhookCount ?? 0,
    apiKeysActive: 0,
    channelSmoke: channelSkipped,
    p0Staging: p0Skipped,
    cards: [],
    liveProofSlices: [],
    sso: { entitlementEnabled: true, configured: false, active: false },
  });
  const smokeArtifacts = buildIntegrationHealthSmokeArtifactsModel({
    channelLive: channelSkipped,
    p0Staging: p0Skipped,
    stagingWorkflows: stagingSkipped,
  });
  return { channelCards, smokeArtifacts };
}

describe("integration health recovery era19", () => {
  it("locks era19 recovery policy and quick links", () => {
    expect(INTEGRATION_HEALTH_RECOVERY_ERA19_POLICY_ID).toBe(
      "era19-integration-health-recovery-v1",
    );
    expect(INTEGRATION_HEALTH_RECOVERY_QUICK_LINKS.some((link) => link.id === "webhook-queue")).toBe(
      true,
    );
    expect(INTEGRATION_HEALTH_RECOVERY_QUICK_LINKS.some((link) => link.id === "import-center")).toBe(
      true,
    );
  });

  it("builds urgent webhook backlog step when queue is blocked", () => {
    const { channelCards, smokeArtifacts } = buildFixtures({ failedWebhookCount: 3 });
    const steps = buildIntegrationHealthRecoverySteps({ channelCards, smokeArtifacts });

    expect(steps.some((step) => step.id === "webhook-backlog" && step.severity === "urgent")).toBe(
      true,
    );
    expect(steps.some((step) => step.href === "/dashboard/sales-channels/webhooks")).toBe(true);
  });

  it("includes P0 ops credentials step without faking PASS", () => {
    const { channelCards, smokeArtifacts } = buildFixtures();
    const steps = buildIntegrationHealthRecoverySteps({ channelCards, smokeArtifacts });

    const p0Step = steps.find((step) => step.id === "p0-ops-credentials");
    expect(p0Step).toBeDefined();
    expect(p0Step?.detail).toContain("Awaiting");
    expect(p0Step?.detail).not.toContain("PASS");
  });

  it("prioritizes urgent steps before normal setup steps", () => {
    const { channelCards, smokeArtifacts } = buildFixtures({ failedWebhookCount: 2 });
    const steps = buildIntegrationHealthRecoverySteps({ channelCards, smokeArtifacts });

    const firstUrgentIndex = steps.findIndex((step) => step.severity === "urgent");
    const firstNormalIndex = steps.findIndex((step) => step.severity === "normal");
    if (firstUrgentIndex >= 0 && firstNormalIndex >= 0) {
      expect(firstUrgentIndex).toBeLessThan(firstNormalIndex);
    }
  });

  it("deduplicates steps by id and href", () => {
    const { channelCards, smokeArtifacts } = buildFixtures({ failedWebhookCount: 1 });
    const steps = buildIntegrationHealthRecoverySteps({ channelCards, smokeArtifacts });
    const keys = steps.map((step) => `${step.id}:${step.href}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("builds aggregate recovery model with quick links", () => {
    const { channelCards, smokeArtifacts } = buildFixtures();
    const model = buildIntegrationHealthRecoveryModel({ channelCards, smokeArtifacts });

    expect(model.policyId).toBe("era19-integration-health-recovery-v1");
    expect(model.quickLinks.length).toBeGreaterThanOrEqual(8);
    expect(model.opsChecklistDoc).toContain("era18-p0-staging-proof-ops-checklist");
  });

  it("reports non-urgent headline when only normal setup steps remain", () => {
    const healthyChannelSmoke: ChannelLiveSmokeSummary = {
      ...channelSkipped,
      overall: "PASSED",
      wooLiveProofStatus: "proof_passed",
      shopifyLiveProofStatus: "proof_passed",
      missingEnvVars: [],
    };
    const channelCards = buildIntegrationHealthChannelCardsModel({
      stripeConfigured: true,
      stripeMissingEnvVars: [],
      failedWebhookCount: 0,
      apiKeysActive: 2,
      channelSmoke: healthyChannelSmoke,
      p0Staging: { ...p0Skipped, overall: "PASSED", p0ProofStatus: "proof_passed" },
      cards: [],
      liveProofSlices: [],
      sso: null,
    });
    const smokeArtifacts = buildIntegrationHealthSmokeArtifactsModel({
      channelLive: healthyChannelSmoke,
      p0Staging: { ...p0Skipped, overall: "PASSED", p0ProofStatus: "proof_passed" },
      stagingWorkflows: { ...stagingSkipped, overall: "PASSED" },
    });
    const steps = buildIntegrationHealthRecoverySteps({ channelCards, smokeArtifacts });
    const summary = summarizeIntegrationHealthRecovery(steps);

    expect(summary.hasUrgentSteps).toBe(false);
    expect(steps.length).toBe(0);
    expect(summary.headline).toContain("No urgent");
  });
});

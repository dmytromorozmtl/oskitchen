import { describe, expect, it } from "vitest";

import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { StagingWorkflowFirstGreenSummary } from "@/lib/ci/staging-workflows-first-green-summary";
import {
  buildChannelLiveSmokeArtifactRow,
  buildIntegrationHealthSmokeArtifactsModel,
  buildP0StagingSmokeArtifactRow,
  buildStagingWorkflowsSmokeArtifactRow,
  normalizeSmokeArtifactOverall,
  summarizeIntegrationHealthSmokeArtifacts,
} from "@/lib/integrations/integration-health-smoke-artifacts-era19";
import {
  INTEGRATION_HEALTH_SMOKE_ARTIFACTS_ERA19_POLICY_ID,
  INTEGRATION_HEALTH_SMOKE_ARTIFACT_PATHS,
} from "@/lib/integrations/integration-health-smoke-artifacts-era19-policy";
import type { ChannelLiveSmokeSummary } from "@/lib/integrations/channel-live-smoke-summary";

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

describe("integration health smoke artifacts era19", () => {
  it("locks era19 smoke artifacts policy and paths", () => {
    expect(INTEGRATION_HEALTH_SMOKE_ARTIFACTS_ERA19_POLICY_ID).toBe(
      "era19-integration-health-smoke-artifacts-v1",
    );
    expect(INTEGRATION_HEALTH_SMOKE_ARTIFACT_PATHS.channelLive).toBe(
      "artifacts/channel-live-smoke-summary.json",
    );
  });

  it("normalizes SKIPPED to SKIPPED WITH REASON", () => {
    expect(normalizeSmokeArtifactOverall("SKIPPED")).toBe("SKIPPED WITH REASON");
    expect(normalizeSmokeArtifactOverall(null)).toBe("MISSING");
  });

  it("builds channel row with honest SKIPPED copy — never LIVE", () => {
    const row = buildChannelLiveSmokeArtifactRow(channelSkipped);
    expect(row.displayStatus).toBe("SKIPPED WITH REASON");
    expect(row.honestyNote).toContain("LIVE");
    expect(row.missingEnvVars).toContain("DATABASE_URL");
  });

  it("builds missing artifact row without faking PASS", () => {
    const row = buildStagingWorkflowsSmokeArtifactRow(null);
    expect(row.displayStatus).toBe("MISSING");
    expect(row.detail).toContain("not found");
  });

  it("builds P0 row with child summary and missing env vars", () => {
    const row = buildP0StagingSmokeArtifactRow(p0Skipped);
    expect(row.displayStatus).toBe("SKIPPED WITH REASON");
    expect(row.proofStatus).toBe("awaiting_ops_credentials");
    expect(row.detail).toContain("Awaiting ops credentials");
  });

  it("builds aggregate model with recovery links", () => {
    const model = buildIntegrationHealthSmokeArtifactsModel({
      channelLive: channelSkipped,
      p0Staging: p0Skipped,
      stagingWorkflows: stagingSkipped,
    });

    expect(model.rows).toHaveLength(3);
    expect(model.hasAnyArtifact).toBe(true);
    expect(model.recoveryLinks.length).toBeGreaterThan(0);
    expect(model.headline).toContain("SKIPPED WITH REASON");
  });

  it("headline reports FAILED when any child failed", () => {
    const failedRow = buildChannelLiveSmokeArtifactRow({
      ...channelSkipped,
      overall: "FAILED",
    });
    const summary = summarizeIntegrationHealthSmokeArtifacts([
      failedRow,
      buildStagingWorkflowsSmokeArtifactRow(stagingSkipped),
      buildP0StagingSmokeArtifactRow(p0Skipped),
    ]);
    expect(summary.headline).toContain("FAILED");
  });
});

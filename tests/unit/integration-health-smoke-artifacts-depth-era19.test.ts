import { describe, expect, it } from "vitest";

import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { StagingWorkflowFirstGreenSummary } from "@/lib/ci/staging-workflows-first-green-summary";
import {
  buildIntegrationHealthSmokeArtifactsModel,
  buildP0StagingSmokeArtifactRow,
} from "@/lib/integrations/integration-health-smoke-artifacts-era19";
import {
  buildIntegrationHealthSmokeArtifactsDepthSlice,
  buildP0StagingChildProofRows,
  buildStagingWorkflowGitHubRunLinks,
  collectIntegrationHealthSmokeMissingEnvVars,
  enrichIntegrationHealthSmokeArtifactRows,
  pickIntegrationHealthNextSmokeAction,
} from "@/lib/integrations/integration-health-smoke-artifacts-depth-era19";
import {
  INTEGRATION_HEALTH_SMOKE_ARTIFACTS_DEPTH_ERA19_BACKLOG_ID,
  INTEGRATION_HEALTH_SMOKE_ARTIFACTS_DEPTH_ERA19_POLICY_ID,
} from "@/lib/integrations/integration-health-smoke-artifacts-depth-era19-policy";
import type { ChannelLiveSmokeSummary } from "@/lib/integrations/channel-live-smoke-summary";

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
      missingEnvVars: ["SSO_STAGING_WORKSPACE_ID"],
    },
    stagingWorkflowsFirstGreen: {
      smokeScript: "smoke:staging-workflows-first-green",
      artifactPath: "artifacts/staging-workflows-first-green-summary.json",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: ["E2E_LOGIN_EMAIL"],
    },
    channelLive: {
      smokeScript: "smoke:woo-shopify-live",
      artifactPath: "artifacts/channel-live-smoke-summary.json",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: ["CHANNEL_SMOKE_OWNER_EMAIL"],
    },
  },
};

const stagingWithRuns: StagingWorkflowFirstGreenSummary = {
  version: "era17-staging-workflows-first-green-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  overall: "SKIPPED",
  wiringCertPassed: true,
  stagingSecretsConfigured: false,
  stagingHealthChecked: false,
  firstGreenProofStatus: "proof_skipped_missing_prerequisites",
  missingEnvVars: ["E2E_STAGING_BASE_URL"],
  githubRuns: [
    {
      workflowId: "staging-e2e",
      label: "Staging E2E",
      runUrl: "https://github.com/example/repo/actions/runs/1",
      outcome: "SKIPPED",
    },
  ],
  githubPassedCount: 0,
  steps: [],
};

const channelSkipped: ChannelLiveSmokeSummary = {
  version: "era17-channel-live-smoke-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  overall: "SKIPPED",
  wooLiveProofStatus: "proof_skipped_missing_prerequisites",
  shopifyLiveProofStatus: "proof_skipped_missing_prerequisites",
  missingEnvVars: ["DATABASE_URL"],
  steps: [],
};

describe("integration-health-smoke-artifacts-depth-era19 policy", () => {
  it("registers era19 smoke artifacts depth proof", () => {
    expect(INTEGRATION_HEALTH_SMOKE_ARTIFACTS_DEPTH_ERA19_POLICY_ID).toBe(
      "era19-integration-health-smoke-artifacts-depth-v1",
    );
    expect(INTEGRATION_HEALTH_SMOKE_ARTIFACTS_DEPTH_ERA19_BACKLOG_ID).toBe("KOS-E19-021");
  });
});

describe("buildP0StagingChildProofRows", () => {
  it("surfaces SSO, workflows, and channel child proofs", () => {
    const rows = buildP0StagingChildProofRows(p0Skipped);
    expect(rows).toHaveLength(3);
    expect(rows.every((row) => row.displayStatus === "SKIPPED WITH REASON")).toBe(true);
    expect(rows.find((row) => row.id === "p0-child-sso")?.missingEnvVars).toContain(
      "SSO_STAGING_WORKSPACE_ID",
    );
  });
});

describe("buildStagingWorkflowGitHubRunLinks", () => {
  it("preserves GitHub run URLs for operator triage", () => {
    const runs = buildStagingWorkflowGitHubRunLinks(stagingWithRuns);
    expect(runs[0]?.runUrl).toContain("github.com");
  });
});

describe("pickIntegrationHealthNextSmokeAction", () => {
  it("prioritizes P0 staging unblock when all smokes are skipped", () => {
    const model = buildIntegrationHealthSmokeArtifactsModel({
      channelLive: channelSkipped,
      p0Staging: p0Skipped,
      stagingWorkflows: stagingWithRuns,
    });

    expect(model.depth.nextSmokeAction?.rowId).toBe("p0-staging-proof-unblock");
    expect(model.depth.nextSmokeAction?.smokeScript).toBe("npm run smoke:p0-staging-proof-unblock");
    expect(model.depth.nextSmokeAction?.reason).toContain("SKIPPED WITH REASON");
  });

  it("prioritizes FAILED rows over skipped", () => {
    const failedChannel: ChannelLiveSmokeSummary = { ...channelSkipped, overall: "FAILED" };
    const model = buildIntegrationHealthSmokeArtifactsModel({
      channelLive: failedChannel,
      p0Staging: p0Skipped,
      stagingWorkflows: stagingWithRuns,
    });

    expect(model.depth.nextSmokeAction?.rowId).toBe("channel-live-smoke");
    expect(model.depth.nextSmokeAction?.displayStatus).toBe("FAILED");
  });
});

describe("collectIntegrationHealthSmokeMissingEnvVars", () => {
  it("dedupes missing env vars across rows and child proofs", () => {
    const baseRow = buildP0StagingSmokeArtifactRow(p0Skipped);
    const enriched = enrichIntegrationHealthSmokeArtifactRows({
      rows: [baseRow],
      p0Staging: p0Skipped,
      stagingWorkflows: null,
    });
    const keys = collectIntegrationHealthSmokeMissingEnvVars(enriched);
    expect(keys).toContain("DATABASE_URL");
    expect(keys).toContain("SSO_STAGING_WORKSPACE_ID");
    expect(keys.filter((key) => key === "DATABASE_URL")).toHaveLength(1);
  });
});

describe("buildIntegrationHealthSmokeArtifactsDepthSlice", () => {
  it("builds depth slice on enriched rows", () => {
    const model = buildIntegrationHealthSmokeArtifactsModel({
      channelLive: channelSkipped,
      p0Staging: p0Skipped,
      stagingWorkflows: stagingWithRuns,
    });

    expect(model.rows.find((row) => row.id === "p0-staging-proof-unblock")?.childProofs).toHaveLength(
      3,
    );
    expect(
      model.rows.find((row) => row.id === "staging-workflows-first-green")?.githubRuns,
    ).toHaveLength(1);
    expect(model.depth.allMissingEnvVars.length).toBeGreaterThan(2);

    const slice = buildIntegrationHealthSmokeArtifactsDepthSlice({ rows: model.rows });
    expect(slice.nextSmokeAction).not.toBeNull();
  });
});

import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { StagingWorkflowFirstGreenSummary } from "@/lib/ci/staging-workflows-first-green-summary";
import type { ChannelLiveSmokeSummary } from "@/lib/integrations/channel-live-smoke-summary";
import {
  INTEGRATION_HEALTH_SMOKE_ARTIFACT_PATHS,
  INTEGRATION_HEALTH_SMOKE_ARTIFACTS_ERA19_POLICY_ID,
  INTEGRATION_HEALTH_SMOKE_RECOVERY_LINKS,
} from "@/lib/integrations/integration-health-smoke-artifacts-era19-policy";
import {
  buildIntegrationHealthSmokeArtifactsDepthSlice,
  enrichIntegrationHealthSmokeArtifactRows,
  type IntegrationHealthSmokeArtifactsDepthSlice,
  type IntegrationHealthSmokeChildProofRow,
  type IntegrationHealthSmokeGitHubRunLink,
} from "@/lib/integrations/integration-health-smoke-artifacts-depth-era19";

export const INTEGRATION_HEALTH_SMOKE_ARTIFACTS_AGGREGATOR_ERA19_POLICY_ID =
  "era19-integration-health-smoke-artifacts-aggregator-v1" as const;

export type IntegrationHealthSmokeDisplayStatus =
  | "PASSED"
  | "FAILED"
  | "SKIPPED WITH REASON"
  | "MISSING";

export type IntegrationHealthSmokeArtifactRow = {
  id: string;
  label: string;
  artifactPath: string;
  smokeScript: string;
  displayStatus: IntegrationHealthSmokeDisplayStatus;
  overall: string | null;
  proofStatus: string | null;
  missingEnvVars: string[];
  runAt: string | null;
  detail: string;
  honestyNote: string;
  nextAction: { label: string; href: string } | null;
  childProofs?: IntegrationHealthSmokeChildProofRow[];
  githubRuns?: IntegrationHealthSmokeGitHubRunLink[];
};

export type IntegrationHealthSmokeArtifactsModel = {
  policyId: typeof INTEGRATION_HEALTH_SMOKE_ARTIFACTS_ERA19_POLICY_ID;
  loadedAt: string;
  headline: string;
  hasAnyArtifact: boolean;
  rows: IntegrationHealthSmokeArtifactRow[];
  recoveryLinks: typeof INTEGRATION_HEALTH_SMOKE_RECOVERY_LINKS;
  depth: IntegrationHealthSmokeArtifactsDepthSlice;
};

export function normalizeSmokeArtifactOverall(
  overall: string | null | undefined,
): IntegrationHealthSmokeDisplayStatus {
  if (!overall) return "MISSING";
  if (overall === "PASSED") return "PASSED";
  if (overall === "FAILED") return "FAILED";
  if (overall === "SKIPPED") return "SKIPPED WITH REASON";
  return "MISSING";
}

function missingArtifactRow(input: {
  id: string;
  label: string;
  artifactPath: string;
  smokeScript: string;
  nextAction: { label: string; href: string };
}): IntegrationHealthSmokeArtifactRow {
  return {
    id: input.id,
    label: input.label,
    artifactPath: input.artifactPath,
    smokeScript: input.smokeScript,
    displayStatus: "MISSING",
    overall: null,
    proofStatus: null,
    missingEnvVars: [],
    runAt: null,
    detail: "Artifact not found on this host — run the smoke script locally or in CI.",
    honestyNote: "Missing artifact is not a PASS claim.",
    nextAction: input.nextAction,
  };
}

export function buildChannelLiveSmokeArtifactRow(
  artifact: ChannelLiveSmokeSummary | null,
): IntegrationHealthSmokeArtifactRow {
  if (!artifact) {
    return missingArtifactRow({
      id: "channel-live-smoke",
      label: "Woo / Shopify live smoke",
      artifactPath: INTEGRATION_HEALTH_SMOKE_ARTIFACT_PATHS.channelLive,
      smokeScript: "npm run smoke:woo-shopify-live",
      nextAction: { label: "Open connection tests", href: "/dashboard/sales-channels/health" },
    });
  }

  const displayStatus = normalizeSmokeArtifactOverall(artifact.overall);
  const proofParts = [artifact.wooLiveProofStatus, artifact.shopifyLiveProofStatus]
    .filter(Boolean)
    .join(" · ");

  let detail: string;
  if (displayStatus === "PASSED") {
    detail = "Engineering live smoke PASSED for configured providers — still not a marketplace LIVE claim.";
  } else if (displayStatus === "FAILED") {
    detail = "Engineering live smoke FAILED — fix channel credentials and mapping before pilot scale.";
  } else {
    detail =
      artifact.missingEnvVars.length > 0
        ? `SKIPPED WITH REASON — ${artifact.missingEnvVars.length} env var(s) missing.`
        : "SKIPPED WITH REASON — prerequisites not met.";
  }

  return {
    id: "channel-live-smoke",
    label: "Woo / Shopify live smoke",
    artifactPath: INTEGRATION_HEALTH_SMOKE_ARTIFACT_PATHS.channelLive,
    smokeScript: "npm run smoke:woo-shopify-live",
    displayStatus,
    overall: artifact.overall,
    proofStatus: proofParts || null,
    missingEnvVars: artifact.missingEnvVars,
    runAt: artifact.runAt,
    detail,
    honestyNote: "In-app pilot ready ≠ LIVE marketplace certification.",
    nextAction:
      displayStatus === "PASSED"
        ? { label: "Review channel health", href: "/dashboard/sales-channels/health" }
        : { label: "Open product mapping", href: "/dashboard/product-mapping" },
  };
}

export function buildStagingWorkflowsSmokeArtifactRow(
  artifact: StagingWorkflowFirstGreenSummary | null,
): IntegrationHealthSmokeArtifactRow {
  if (!artifact) {
    return missingArtifactRow({
      id: "staging-workflows-first-green",
      label: "GitHub staging workflows first green",
      artifactPath: INTEGRATION_HEALTH_SMOKE_ARTIFACT_PATHS.stagingWorkflows,
      smokeScript: "npm run smoke:staging-workflows-first-green",
      nextAction: { label: "Open launch wizard", href: "/dashboard/launch-wizard" },
    });
  }

  const displayStatus = normalizeSmokeArtifactOverall(artifact.overall);
  let detail: string;
  if (displayStatus === "PASSED") {
    detail = `GitHub first-green proof passed (${artifact.githubPassedCount} run(s) recorded).`;
  } else if (displayStatus === "FAILED") {
    detail = "Staging workflow smoke FAILED — review GitHub run URLs in the artifact.";
  } else {
    detail =
      artifact.missingEnvVars.length > 0
        ? `SKIPPED WITH REASON — missing ${artifact.missingEnvVars.join(", ")}.`
        : `SKIPPED WITH REASON — ${artifact.firstGreenProofStatus.replaceAll("_", " ")}.`;
  }

  return {
    id: "staging-workflows-first-green",
    label: "GitHub staging workflows first green",
    artifactPath: INTEGRATION_HEALTH_SMOKE_ARTIFACT_PATHS.stagingWorkflows,
    smokeScript: "npm run smoke:staging-workflows-first-green",
    displayStatus,
    overall: artifact.overall,
    proofStatus: artifact.firstGreenProofStatus,
    missingEnvVars: artifact.missingEnvVars,
    runAt: artifact.runAt,
    detail,
    honestyNote: "GitHub PASS is engineering proof — not paid pilot GO.",
    nextAction: { label: "Open launch wizard", href: "/dashboard/launch-wizard" },
  };
}

export function buildP0StagingSmokeArtifactRow(
  artifact: P0StagingProofUnblockSummary | null,
): IntegrationHealthSmokeArtifactRow {
  if (!artifact) {
    return missingArtifactRow({
      id: "p0-staging-proof-unblock",
      label: "P0 staging proof unblock",
      artifactPath: INTEGRATION_HEALTH_SMOKE_ARTIFACT_PATHS.p0Staging,
      smokeScript: "npm run smoke:p0-staging-proof-unblock",
      nextAction: { label: "Open launch wizard", href: "/dashboard/launch-wizard" },
    });
  }

  const displayStatus = normalizeSmokeArtifactOverall(artifact.overall);
  const childSummary = [
    `SSO ${artifact.children.ssoIdpStaging.overall ?? "—"}`,
    `workflows ${artifact.children.stagingWorkflowsFirstGreen.overall ?? "—"}`,
    `channel ${artifact.children.channelLive.overall ?? "—"}`,
  ].join(" · ");

  let detail: string;
  if (artifact.p0ProofStatus === "proof_passed") {
    detail = "P0 aggregate proof passed — SSO, staging workflows, and channel child smokes green.";
  } else if (artifact.p0ProofStatus === "proof_failed") {
    detail = `P0 aggregate proof failed — ${childSummary}.`;
  } else {
    detail =
      artifact.allMissingEnvVars.length > 0
        ? `Awaiting ops credentials — ${artifact.allMissingEnvVars.length} env var(s) missing. ${childSummary}.`
        : `P0 proof incomplete — ${childSummary}.`;
  }

  return {
    id: "p0-staging-proof-unblock",
    label: "P0 staging proof unblock",
    artifactPath: INTEGRATION_HEALTH_SMOKE_ARTIFACT_PATHS.p0Staging,
    smokeScript: "npm run smoke:p0-staging-proof-unblock",
    displayStatus,
    overall: artifact.overall,
    proofStatus: artifact.p0ProofStatus,
    missingEnvVars: artifact.allMissingEnvVars,
    runAt: artifact.runAt,
    detail,
    honestyNote: "P0 SKIPPED is honest when credentials are missing — never upgrade to PASS.",
    nextAction: { label: "Open launch wizard", href: "/dashboard/launch-wizard" },
  };
}

export function summarizeIntegrationHealthSmokeArtifacts(
  rows: readonly IntegrationHealthSmokeArtifactRow[],
): { headline: string; hasAnyArtifact: boolean } {
  const hasAnyArtifact = rows.some((row) => row.displayStatus !== "MISSING");
  const hasFailed = rows.some((row) => row.displayStatus === "FAILED");
  const hasPassed = rows.some((row) => row.displayStatus === "PASSED");
  const allSkippedOrMissing = rows.every(
    (row) => row.displayStatus === "SKIPPED WITH REASON" || row.displayStatus === "MISSING",
  );

  let headline: string;
  if (hasFailed) {
    headline = "Engineering smoke FAILED — fix artifacts before commercial live-proof claims.";
  } else if (hasPassed && !allSkippedOrMissing) {
    headline = "Some engineering smoke artifacts passed — confirm child proofs before pilot GO.";
  } else if (allSkippedOrMissing) {
    headline =
      "Engineering smoke SKIPPED WITH REASON or missing — not a LIVE or PASS claim for channels.";
  } else {
    headline = "Review engineering smoke artifacts before scaling pilot channel traffic.";
  }

  return { headline, hasAnyArtifact };
}

export function buildIntegrationHealthSmokeArtifactsModel(input: {
  channelLive: ChannelLiveSmokeSummary | null;
  p0Staging: P0StagingProofUnblockSummary | null;
  stagingWorkflows: StagingWorkflowFirstGreenSummary | null;
  loadedAt?: string;
}): IntegrationHealthSmokeArtifactsModel {
  const baseRows = [
    buildChannelLiveSmokeArtifactRow(input.channelLive),
    buildStagingWorkflowsSmokeArtifactRow(input.stagingWorkflows),
    buildP0StagingSmokeArtifactRow(input.p0Staging),
  ];
  const rows = enrichIntegrationHealthSmokeArtifactRows({
    rows: baseRows,
    p0Staging: input.p0Staging,
    stagingWorkflows: input.stagingWorkflows,
  });
  const summary = summarizeIntegrationHealthSmokeArtifacts(rows);
  const depth = buildIntegrationHealthSmokeArtifactsDepthSlice({ rows });

  return {
    policyId: INTEGRATION_HEALTH_SMOKE_ARTIFACTS_ERA19_POLICY_ID,
    loadedAt: input.loadedAt ?? new Date().toISOString(),
    headline: summary.headline,
    hasAnyArtifact: summary.hasAnyArtifact,
    rows,
    recoveryLinks: INTEGRATION_HEALTH_SMOKE_RECOVERY_LINKS,
    depth,
  };
}

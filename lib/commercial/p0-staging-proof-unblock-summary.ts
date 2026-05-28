/**
 * P0 staging proof unblock summary — aggregates Era 17 P0 smoke artifacts.
 */

import {
  P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID,
  P0_STAGING_PROOF_UNBLOCK_ERA17_PROOF_STATUS,
} from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";

export const P0_STAGING_PROOF_UNBLOCK_SUMMARY_VERSION =
  P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID;

export type P0StagingProofUnblockOverall = "PASSED" | "FAILED" | "SKIPPED";

export type P0StagingProofUnblockStatus =
  | "proof_passed"
  | "awaiting_ops_credentials"
  | "proof_failed";

export type P0StagingProofChildSnapshot = {
  smokeScript: string;
  artifactPath: string;
  overall: string | null;
  proofStatus: string | null;
  missingEnvVars: string[];
};

export type P0StagingProofUnblockSummary = {
  version: typeof P0_STAGING_PROOF_UNBLOCK_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: P0StagingProofUnblockOverall;
  p0ProofStatus: P0StagingProofUnblockStatus;
  defaultProofStatus: typeof P0_STAGING_PROOF_UNBLOCK_ERA17_PROOF_STATUS;
  allMissingEnvVars: string[];
  children: {
    ssoIdpStaging: P0StagingProofChildSnapshot;
    stagingWorkflowsFirstGreen: P0StagingProofChildSnapshot;
    channelLive: P0StagingProofChildSnapshot;
  };
};

type LooseArtifact = {
  overall?: string;
  loginProofStatus?: string;
  firstGreenProofStatus?: string;
  wooLiveProofStatus?: string;
  shopifyLiveProofStatus?: string;
  missingEnvVars?: string[];
};

export function readChildProofStatus(artifact: LooseArtifact | null): string | null {
  if (!artifact) return null;
  return (
    artifact.loginProofStatus ??
    artifact.firstGreenProofStatus ??
    (artifact.wooLiveProofStatus && artifact.shopifyLiveProofStatus
      ? `${artifact.wooLiveProofStatus}/${artifact.shopifyLiveProofStatus}`
      : artifact.wooLiveProofStatus ?? artifact.shopifyLiveProofStatus ?? null)
  );
}

export function resolveP0StagingProofUnblockStatus(input: {
  ssoOverall: string | null;
  workflowsOverall: string | null;
  channelOverall: string | null;
  ssoProof: string | null;
  workflowsProof: string | null;
  channelProof: string | null;
}): P0StagingProofUnblockStatus {
  const failed =
    input.ssoOverall === "FAILED" ||
    input.workflowsOverall === "FAILED" ||
    input.channelOverall === "FAILED" ||
    input.ssoProof === "proof_failed" ||
    input.workflowsProof === "proof_failed" ||
    input.channelProof?.includes("proof_failed");

  if (failed) return "proof_failed";

  const ssoPassed = input.ssoProof === "proof_passed";
  const workflowsPassed = input.workflowsProof === "proof_passed";
  const channelPassed =
    input.channelProof === "proof_passed/proof_passed" ||
    (input.channelProof?.includes("proof_passed") &&
      !input.channelProof.includes("proof_skipped"));

  if (ssoPassed && workflowsPassed && channelPassed) {
    return "proof_passed";
  }

  return "awaiting_ops_credentials";
}

export function resolveP0StagingProofUnblockOverall(
  status: P0StagingProofUnblockStatus,
  childOveralls: Array<string | null>,
): P0StagingProofUnblockOverall {
  if (status === "proof_failed") return "FAILED";
  if (status === "proof_passed") return "PASSED";
  if (childOveralls.some((value) => value === "FAILED")) return "FAILED";
  return "SKIPPED";
}

export function buildP0StagingProofUnblockSummary(input: {
  commitSha?: string | null;
  runAt?: Date;
  ssoArtifact: LooseArtifact | null;
  workflowsArtifact: LooseArtifact | null;
  channelArtifact: LooseArtifact | null;
}): P0StagingProofUnblockSummary {
  const ssoOverall = input.ssoArtifact?.overall ?? null;
  const workflowsOverall = input.workflowsArtifact?.overall ?? null;
  const channelOverall = input.channelArtifact?.overall ?? null;
  const ssoProof = readChildProofStatus(input.ssoArtifact);
  const workflowsProof = readChildProofStatus(input.workflowsArtifact);
  const channelProof = readChildProofStatus(input.channelArtifact);

  const p0ProofStatus = resolveP0StagingProofUnblockStatus({
    ssoOverall,
    workflowsOverall,
    channelOverall,
    ssoProof,
    workflowsProof,
    channelProof,
  });

  const allMissingEnvVars = [
    ...(input.ssoArtifact?.missingEnvVars ?? []),
    ...(input.workflowsArtifact?.missingEnvVars ?? []),
    ...(input.channelArtifact?.missingEnvVars ?? []),
  ].filter((value, index, array) => array.indexOf(value) === index);

  return {
    version: P0_STAGING_PROOF_UNBLOCK_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha?.trim() || null,
    overall: resolveP0StagingProofUnblockOverall(p0ProofStatus, [
      ssoOverall,
      workflowsOverall,
      channelOverall,
    ]),
    p0ProofStatus,
    defaultProofStatus: P0_STAGING_PROOF_UNBLOCK_ERA17_PROOF_STATUS,
    allMissingEnvVars,
    children: {
      ssoIdpStaging: {
        smokeScript: "smoke:enterprise-sso-idp-staging",
        artifactPath: "artifacts/enterprise-sso-idp-staging-smoke-summary.json",
        overall: ssoOverall,
        proofStatus: ssoProof,
        missingEnvVars: input.ssoArtifact?.missingEnvVars ?? [],
      },
      stagingWorkflowsFirstGreen: {
        smokeScript: "smoke:staging-workflows-first-green",
        artifactPath: "artifacts/staging-workflows-first-green-summary.json",
        overall: workflowsOverall,
        proofStatus: workflowsProof,
        missingEnvVars: input.workflowsArtifact?.missingEnvVars ?? [],
      },
      channelLive: {
        smokeScript: "smoke:woo-shopify-live",
        artifactPath: "artifacts/channel-live-smoke-summary.json",
        overall: channelOverall,
        proofStatus: channelProof,
        missingEnvVars: input.channelArtifact?.missingEnvVars ?? [],
      },
    },
  };
}

export function formatP0StagingProofUnblockReportLines(
  summary: P0StagingProofUnblockSummary,
): string[] {
  return [
    `overall: ${summary.overall}`,
    `p0ProofStatus: ${summary.p0ProofStatus}`,
    `allMissingEnvVars: ${summary.allMissingEnvVars.length ? summary.allMissingEnvVars.join(", ") : "(none)"}`,
    `sso: ${summary.children.ssoIdpStaging.overall ?? "unknown"} (${summary.children.ssoIdpStaging.proofStatus ?? "n/a"})`,
    `stagingWorkflows: ${summary.children.stagingWorkflowsFirstGreen.overall ?? "unknown"} (${summary.children.stagingWorkflowsFirstGreen.proofStatus ?? "n/a"})`,
    `channelLive: ${summary.children.channelLive.overall ?? "unknown"} (${summary.children.channelLive.proofStatus ?? "n/a"})`,
  ];
}

/**
 * P0 staging proof integrity — detects fake PASS and optional baseline regression.
 * Policy: era28-p0-staging-proof-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import {
  loadP0StagingProofUnblockSummary,
  resolveP0StagingProofUnblockStatus,
  type P0StagingProofUnblockStatus,
  type P0StagingProofUnblockSummary,
} from "@/lib/commercial/p0-staging-proof-unblock-summary";

export const P0_STAGING_PROOF_INTEGRITY_ERA28_POLICY_ID =
  "era28-p0-staging-proof-integrity-v1" as const;

export const P0_STAGING_PROOF_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/p0-staging-proof-integrity-baseline.json" as const;

export type P0StagingProofIntegrityViolationId =
  | "artifact_missing"
  | "fake_pass_status_mismatch"
  | "fake_pass_overall_skipped"
  | "proof_failed_recorded"
  | "baseline_regression";

export type P0StagingProofIntegrityViolation = {
  id: P0StagingProofIntegrityViolationId;
  detail: string;
};

export type P0StagingProofIntegrityBaseline = {
  p0ProofStatus: P0StagingProofUnblockStatus;
  recordedAt: string;
  commitSha: string | null;
};

export type P0StagingProofIntegritySummary = {
  policyId: typeof P0_STAGING_PROOF_INTEGRITY_ERA28_POLICY_ID;
  integrityPassed: boolean;
  artifactPresent: boolean;
  artifactPath: typeof P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT;
  p0ProofStatus: P0StagingProofUnblockStatus | null;
  recomputedProofStatus: P0StagingProofUnblockStatus | null;
  overall: string | null;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly P0StagingProofIntegrityViolation[];
  recommendedCommands: readonly string[];
};

function readIntegrityBaseline(root: string): P0StagingProofIntegrityBaseline | null {
  try {
    const path = join(root, P0_STAGING_PROOF_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as P0StagingProofIntegrityBaseline;
  } catch {
    return null;
  }
}

export function recomputeP0StagingProofStatusFromSummary(
  summary: P0StagingProofUnblockSummary,
): P0StagingProofUnblockStatus {
  return resolveP0StagingProofUnblockStatus({
    ssoOverall: summary.children.ssoIdpStaging.overall,
    workflowsOverall: summary.children.stagingWorkflowsFirstGreen.overall,
    channelOverall: summary.children.channelLive.overall,
    ssoProof: summary.children.ssoIdpStaging.proofStatus,
    workflowsProof: summary.children.stagingWorkflowsFirstGreen.proofStatus,
    channelProof: summary.children.channelLive.proofStatus,
  });
}

export function evaluateP0StagingProofIntegrity(
  root: string = process.cwd(),
  options?: {
    artifactOverride?: P0StagingProofUnblockSummary | null;
    baselineOverride?: P0StagingProofIntegrityBaseline | null;
  },
): P0StagingProofIntegritySummary {
  const artifact =
    options?.artifactOverride !== undefined
      ? options.artifactOverride
      : loadP0StagingProofUnblockSummary(root);

  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);
  const violations: P0StagingProofIntegrityViolation[] = [];

  if (!artifact) {
    violations.push({
      id: "artifact_missing",
      detail: `No ${P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT} — run smoke after vault configure (honest SKIPPED until then).`,
    });
    return {
      policyId: P0_STAGING_PROOF_INTEGRITY_ERA28_POLICY_ID,
      integrityPassed: true,
      artifactPresent: false,
      artifactPath: P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT,
      p0ProofStatus: null,
      recomputedProofStatus: null,
      overall: null,
      baselinePresent: baseline !== null,
      regressionDetected: false,
      violations,
      recommendedCommands: [
        "npm run ops:validate-p0-vault-env -- --json",
        "npm run smoke:p0-staging-proof-unblock -- --checklist-only",
      ],
    };
  }

  const recomputedProofStatus = recomputeP0StagingProofStatusFromSummary(artifact);

  if (artifact.p0ProofStatus === "proof_passed" && recomputedProofStatus !== "proof_passed") {
    violations.push({
      id: "fake_pass_status_mismatch",
      detail: `Artifact claims proof_passed but child smokes recompute ${recomputedProofStatus} — never hand-edit PASS.`,
    });
  }

  if (artifact.p0ProofStatus === "proof_passed" && artifact.overall !== "PASSED") {
    violations.push({
      id: "fake_pass_overall_skipped",
      detail: `p0ProofStatus proof_passed but overall=${artifact.overall} — SKIPPED ≠ PASS.`,
    });
  }

  if (artifact.p0ProofStatus === "proof_failed") {
    violations.push({
      id: "proof_failed_recorded",
      detail: "P0 proof_failed — fix child smokes before pilot or GTM claims.",
    });
  }

  if (
    baseline?.p0ProofStatus === "proof_passed" &&
    artifact.p0ProofStatus !== "proof_passed"
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded proof_passed at ${baseline.recordedAt} but current status is ${artifact.p0ProofStatus}.`,
    });
  }

  const blockingIds: readonly P0StagingProofIntegrityViolationId[] = [
    "fake_pass_status_mismatch",
    "fake_pass_overall_skipped",
    "baseline_regression",
    "proof_failed_recorded",
  ];
  const integrityPassed = !violations.some((row) =>
    (blockingIds as readonly string[]).includes(row.id),
  );
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: P0_STAGING_PROOF_INTEGRITY_ERA28_POLICY_ID,
    integrityPassed,
    artifactPresent: true,
    artifactPath: P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT,
    p0ProofStatus: artifact.p0ProofStatus,
    recomputedProofStatus,
    overall: artifact.overall,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-p0-staging-proof-integrity -- --json",
      "npm run smoke:p0-staging-proof-unblock",
      "npm run ops:validate-p0-vault-env -- --json",
      "npm run ops:run-p0-vault-day0-orchestrator -- --json",
    ],
  };
}

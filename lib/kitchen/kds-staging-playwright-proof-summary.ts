/**
 * KDS staging Playwright proof summary — Evolution Era 17 Workstream F Cycle 25.
 */

import {
  buildStagingWorkflowGitHubRunRecords,
  type StagingWorkflowGitHubRunRecord,
} from "@/lib/ci/staging-workflows-first-green-summary";

import { KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_POLICY_ID } from "@/lib/kitchen/kds-staging-playwright-proof-era17-policy";

export const KDS_STAGING_PLAYWRIGHT_PROOF_SUMMARY_VERSION =
  KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_POLICY_ID;

export type KdsStagingPlaywrightProofStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type KdsStagingPlaywrightProofStep = {
  id: string;
  label: string;
  status: KdsStagingPlaywrightProofStepStatus;
  reason?: string;
};

export type KdsStagingPlaywrightProofOverall = "PASSED" | "FAILED" | "SKIPPED";

export type KdsStagingPlaywrightProofStatus =
  | "proof_passed"
  | "proof_failed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_missing_github_run";

export type KdsStagingPlaywrightProofSummary = {
  version: typeof KDS_STAGING_PLAYWRIGHT_PROOF_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: KdsStagingPlaywrightProofOverall;
  playwrightProofStatus: KdsStagingPlaywrightProofStatus;
  missingEnvVars: string[];
  githubRun: StagingWorkflowGitHubRunRecord | null;
  steps: KdsStagingPlaywrightProofStep[];
};

export type KdsStagingPlaywrightProofPrerequisiteInput = {
  stagingBaseUrl: string | null;
  loginEmail: string | null;
  loginPassword: string | null;
};

export function listMissingKdsStagingPlaywrightProofEnvVars(
  input: KdsStagingPlaywrightProofPrerequisiteInput,
): string[] {
  const missing: string[] = [];
  if (!input.stagingBaseUrl?.trim()) missing.push("E2E_STAGING_BASE_URL");
  if (!input.loginEmail?.trim()) missing.push("E2E_LOGIN_EMAIL");
  if (!input.loginPassword?.trim()) {
    missing.push("E2E_LOGIN_PASSWORD (or E2E_PASSWORD)");
  }
  return missing;
}

export function formatMissingKdsStagingPlaywrightProofEnvVarsReason(
  missing: readonly string[],
): string {
  if (missing.length === 0) return "All prerequisite env vars set.";
  return `Missing: ${missing.join(", ")}.`;
}

export function evaluateKdsStagingPlaywrightProofPrerequisites(
  input: KdsStagingPlaywrightProofPrerequisiteInput,
): { ok: true } | { ok: false; reason: string } {
  const missing = listMissingKdsStagingPlaywrightProofEnvVars(input);
  if (missing.length > 0) {
    return {
      ok: false,
      reason: formatMissingKdsStagingPlaywrightProofEnvVarsReason(missing),
    };
  }
  return { ok: true };
}

export function buildKdsStagingPlaywrightGitHubRunRecord(input: {
  runUrl: string | null;
  outcome: string | null;
}): StagingWorkflowGitHubRunRecord {
  const [record] = buildStagingWorkflowGitHubRunRecords([
    {
      workflowId: "kds_staging",
      label: "Playwright KDS Staging",
      runUrl: input.runUrl,
      outcome: input.outcome,
    },
  ]);
  return record!;
}

export function resolveKdsStagingPlaywrightProofStatus(input: {
  prerequisitesMet: boolean;
  wiringCertPassed: boolean;
  githubRun: StagingWorkflowGitHubRunRecord | null;
  githubFailed: boolean;
}): KdsStagingPlaywrightProofStatus {
  if (!input.wiringCertPassed || input.githubFailed) return "proof_failed";
  if (!input.prerequisitesMet) return "proof_skipped_missing_prerequisites";
  if (input.githubRun?.outcome === "PASSED" && input.githubRun.runUrl) {
    return "proof_passed";
  }
  return "proof_skipped_missing_github_run";
}

export function formatKdsStagingPlaywrightProofStepLine(
  step: KdsStagingPlaywrightProofStep,
): string {
  if (step.status === "SKIPPED") {
    return `[SKIPPED WITH REASON] ${step.label}: ${step.reason ?? "skipped"}`;
  }
  if (step.status === "FAILED") {
    return `[FAILED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
  }
  return `[PASSED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
}

export function resolveKdsStagingPlaywrightProofOverall(
  steps: readonly KdsStagingPlaywrightProofStep[],
): KdsStagingPlaywrightProofOverall {
  if (steps.some((step) => step.status === "FAILED")) return "FAILED";
  const actionable = steps.filter((step) => step.status !== "SKIPPED");
  if (actionable.length === 0) return "SKIPPED";
  if (actionable.every((step) => step.status === "PASSED")) return "PASSED";
  return "FAILED";
}

export function buildKdsStagingPlaywrightProofSummary(
  steps: readonly KdsStagingPlaywrightProofStep[],
  input?: {
    commitSha?: string | null;
    missingEnvVars?: readonly string[];
    githubRun?: StagingWorkflowGitHubRunRecord | null;
  },
  runAt: Date = new Date(),
): KdsStagingPlaywrightProofSummary {
  const wiringCertPassed = steps.some(
    (step) => step.id === "wiring_cert" && step.status === "PASSED",
  );
  const prerequisitesMet =
    (input?.missingEnvVars?.length ?? 0) === 0 &&
    steps.some((step) => step.id === "staging_secrets" && step.status === "PASSED");
  const githubRun = input?.githubRun ?? null;
  const githubFailed =
    githubRun?.outcome === "FAILED" ||
    steps.some((step) => step.id === "github_kds_run" && step.status === "FAILED");

  return {
    version: KDS_STAGING_PLAYWRIGHT_PROOF_SUMMARY_VERSION,
    runAt: runAt.toISOString(),
    commitSha: input?.commitSha?.trim() || null,
    overall: resolveKdsStagingPlaywrightProofOverall(steps),
    playwrightProofStatus: resolveKdsStagingPlaywrightProofStatus({
      prerequisitesMet,
      wiringCertPassed,
      githubRun,
      githubFailed,
    }),
    missingEnvVars: [...(input?.missingEnvVars ?? [])],
    githubRun,
    steps: [...steps],
  };
}

export function formatKdsStagingPlaywrightProofReportLines(
  summary: KdsStagingPlaywrightProofSummary,
): string[] {
  return [
    `KDS staging Playwright proof (${summary.version}) — overall: ${summary.overall}`,
    `Run at: ${summary.runAt}`,
    `Commit SHA: ${summary.commitSha ?? "not recorded"}`,
    `Playwright proof status: ${summary.playwrightProofStatus}`,
    `GitHub run: ${summary.githubRun?.runUrl ?? "not recorded"}`,
    "",
    ...summary.steps.map((step) => formatKdsStagingPlaywrightProofStepLine(step)),
  ];
}

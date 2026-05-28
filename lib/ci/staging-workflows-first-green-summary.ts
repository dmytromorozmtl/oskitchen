/**
 * Staging workflows first green summary — Evolution Era 16 Cycle 14 + Era 17 P0 proof.
 *
 * PASSED / FAILED / SKIPPED WITH REASON for optional GitHub staging workflows.
 */

export const STAGING_WORKFLOWS_FIRST_GREEN_SUMMARY_VERSION =
  "era17-staging-workflows-first-green-v1" as const;

export type StagingWorkflowFirstGreenStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type StagingWorkflowFirstGreenStep = {
  id: string;
  label: string;
  status: StagingWorkflowFirstGreenStepStatus;
  reason?: string;
};

export type StagingWorkflowFirstGreenOverall = "PASSED" | "FAILED" | "SKIPPED";

export type StagingWorkflowFirstGreenProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_missing_github_run"
  | "proof_partial"
  | "proof_failed";

export type StagingWorkflowGitHubRunRecord = {
  workflowId: string;
  label: string;
  runUrl: string | null;
  outcome: "PASSED" | "FAILED" | "SKIPPED" | null;
};

export type StagingWorkflowFirstGreenSummary = {
  version: typeof STAGING_WORKFLOWS_FIRST_GREEN_SUMMARY_VERSION;
  runAt: string;
  overall: StagingWorkflowFirstGreenOverall;
  wiringCertPassed: boolean;
  stagingSecretsConfigured: boolean;
  stagingHealthChecked: boolean;
  firstGreenProofStatus: StagingWorkflowFirstGreenProofStatus;
  missingEnvVars: string[];
  githubRuns: StagingWorkflowGitHubRunRecord[];
  githubPassedCount: number;
  steps: StagingWorkflowFirstGreenStep[];
};

export type StagingWorkflowFirstGreenPrerequisiteInput = {
  stagingBaseUrl?: string | null;
  loginEmail?: string | null;
  loginPassword?: string | null;
};

const PREREQUISITE_ENV_CHECKS: readonly {
  key: string;
  present: (input: StagingWorkflowFirstGreenPrerequisiteInput) => boolean;
}[] = [
  {
    key: "E2E_STAGING_BASE_URL",
    present: (input) => Boolean(input.stagingBaseUrl?.trim()),
  },
  {
    key: "E2E_LOGIN_EMAIL",
    present: (input) => Boolean(input.loginEmail?.trim()),
  },
  {
    key: "E2E_LOGIN_PASSWORD",
    present: (input) => Boolean(input.loginPassword?.trim()),
  },
];

export function listMissingStagingWorkflowFirstGreenEnvVars(
  input: StagingWorkflowFirstGreenPrerequisiteInput,
): string[] {
  return PREREQUISITE_ENV_CHECKS.filter((check) => !check.present(input)).map(
    (check) => check.key,
  );
}

export function formatMissingStagingWorkflowFirstGreenEnvVarsReason(
  missingKeys: readonly string[],
): string {
  if (missingKeys.length === 0) {
    return "All staging E2E prerequisite env vars are set.";
  }
  return `Missing env vars: ${missingKeys.join(", ")} — configure GitHub Actions secrets before first green proof.`;
}

export type StagingWorkflowGitHubEvidenceInput = {
  workflowId: string;
  label: string;
  runUrl?: string | null;
  outcome?: string | null;
};

export function normalizeGitHubRunOutcome(
  raw: string | null | undefined,
): "PASSED" | "FAILED" | "SKIPPED" | null {
  const value = raw?.trim().toUpperCase();
  if (value === "PASSED") return "PASSED";
  if (value === "FAILED") return "FAILED";
  if (value === "SKIPPED" || value === "SKIPPED WITH REASON") return "SKIPPED";
  return null;
}

export function buildStagingWorkflowGitHubRunRecords(
  inputs: readonly StagingWorkflowGitHubEvidenceInput[],
): StagingWorkflowGitHubRunRecord[] {
  return inputs.map((input) => ({
    workflowId: input.workflowId,
    label: input.label,
    runUrl: input.runUrl?.trim() || null,
    outcome: normalizeGitHubRunOutcome(input.outcome),
  }));
}

export function countGitHubPassedRuns(
  records: readonly StagingWorkflowGitHubRunRecord[],
): number {
  return records.filter((record) => record.outcome === "PASSED").length;
}

export function resolveStagingWorkflowFirstGreenProofStatus(input: {
  prerequisitesMet: boolean;
  githubPassedCount: number;
  githubFailed: boolean;
}): StagingWorkflowFirstGreenProofStatus {
  if (!input.prerequisitesMet) return "proof_skipped_missing_prerequisites";
  if (input.githubFailed) return "proof_failed";
  if (input.githubPassedCount >= 2) return "proof_passed";
  if (input.githubPassedCount === 1) return "proof_partial";
  return "proof_skipped_missing_github_run";
}

export function evaluateStagingWorkflowFirstGreenPrerequisites(
  input: StagingWorkflowFirstGreenPrerequisiteInput,
): { ok: true } | { ok: false; reason: string } {
  const missing = listMissingStagingWorkflowFirstGreenEnvVars(input);
  if (missing.length > 0) {
    return {
      ok: false,
      reason: formatMissingStagingWorkflowFirstGreenEnvVarsReason(missing),
    };
  }
  return { ok: true };
}

export function formatStagingWorkflowFirstGreenStepLine(
  step: StagingWorkflowFirstGreenStep,
): string {
  if (step.status === "SKIPPED") {
    return `[SKIPPED WITH REASON] ${step.label}: ${step.reason ?? "skipped"}`;
  }
  if (step.status === "FAILED") {
    return `[FAILED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
  }
  return `[PASSED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
}

export function resolveStagingWorkflowFirstGreenOverall(
  steps: readonly StagingWorkflowFirstGreenStep[],
): StagingWorkflowFirstGreenOverall {
  if (steps.some((step) => step.status === "FAILED")) return "FAILED";
  const actionable = steps.filter((step) => step.status !== "SKIPPED");
  if (actionable.length === 0) return "SKIPPED";
  if (actionable.every((step) => step.status === "PASSED")) return "PASSED";
  return "FAILED";
}

export function buildStagingWorkflowFirstGreenSummary(
  steps: readonly StagingWorkflowFirstGreenStep[],
  input?: {
    missingEnvVars?: readonly string[];
    githubRuns?: readonly StagingWorkflowGitHubRunRecord[];
  },
): StagingWorkflowFirstGreenSummary {
  const wiringCertPassed = steps.some(
    (step) => step.id === "wiring_cert" && step.status === "PASSED",
  );
  const stagingSecretsConfigured = steps.some(
    (step) => step.id === "staging_secrets" && step.status === "PASSED",
  );
  const stagingHealthChecked = steps.some(
    (step) => step.id === "staging_health" && step.status === "PASSED",
  );
  const githubRuns = [...(input?.githubRuns ?? [])];
  const githubPassedCount = countGitHubPassedRuns(githubRuns);
  const githubFailed = githubRuns.some((record) => record.outcome === "FAILED");
  const firstGreenProofStatus = resolveStagingWorkflowFirstGreenProofStatus({
    prerequisitesMet: stagingSecretsConfigured,
    githubPassedCount,
    githubFailed,
  });

  let overall = resolveStagingWorkflowFirstGreenOverall(steps);
  if (firstGreenProofStatus !== "proof_passed" && overall === "PASSED") {
    overall =
      firstGreenProofStatus === "proof_failed" ? "FAILED" : "SKIPPED";
  }

  return {
    version: STAGING_WORKFLOWS_FIRST_GREEN_SUMMARY_VERSION,
    runAt: new Date().toISOString(),
    overall,
    wiringCertPassed,
    stagingSecretsConfigured,
    stagingHealthChecked,
    firstGreenProofStatus,
    missingEnvVars: [...(input?.missingEnvVars ?? [])],
    githubRuns,
    githubPassedCount,
    steps: [...steps],
  };
}

export function formatStagingWorkflowFirstGreenReportLines(
  summary: StagingWorkflowFirstGreenSummary,
): string[] {
  return [
    `Staging workflows first green (${summary.version}) — overall: ${summary.overall}`,
    `Run at: ${summary.runAt}`,
    `Wiring cert: ${summary.wiringCertPassed ? "passed" : "not passed"}`,
    `Staging secrets: ${summary.stagingSecretsConfigured ? "configured" : "missing or skipped"}`,
    `First green proof status: ${summary.firstGreenProofStatus}`,
    `GitHub PASSED count: ${summary.githubPassedCount}/3 (Era 17 target: ≥2)`,
    summary.missingEnvVars.length > 0
      ? `Missing env vars: ${summary.missingEnvVars.join(", ")}`
      : "Missing env vars: none",
    "",
    ...summary.steps.map((step) => formatStagingWorkflowFirstGreenStepLine(step)),
  ];
}

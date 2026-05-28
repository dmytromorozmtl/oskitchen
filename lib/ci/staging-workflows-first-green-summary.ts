/**
 * Staging workflows first green summary — Evolution Era 16 Cycle 14.
 *
 * PASSED / FAILED / SKIPPED WITH REASON for optional GitHub staging workflows.
 */

export const STAGING_WORKFLOWS_FIRST_GREEN_SUMMARY_VERSION =
  "era16-staging-workflows-first-green-v1" as const;

export type StagingWorkflowFirstGreenStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type StagingWorkflowFirstGreenStep = {
  id: string;
  label: string;
  status: StagingWorkflowFirstGreenStepStatus;
  reason?: string;
};

export type StagingWorkflowFirstGreenOverall = "PASSED" | "FAILED" | "SKIPPED";

export type StagingWorkflowFirstGreenSummary = {
  version: typeof STAGING_WORKFLOWS_FIRST_GREEN_SUMMARY_VERSION;
  runAt: string;
  overall: StagingWorkflowFirstGreenOverall;
  wiringCertPassed: boolean;
  stagingSecretsConfigured: boolean;
  stagingHealthChecked: boolean;
  steps: StagingWorkflowFirstGreenStep[];
};

export type StagingWorkflowFirstGreenPrerequisiteInput = {
  stagingBaseUrl?: string | null;
  loginEmail?: string | null;
  loginPassword?: string | null;
};

export function evaluateStagingWorkflowFirstGreenPrerequisites(
  input: StagingWorkflowFirstGreenPrerequisiteInput,
): { ok: true } | { ok: false; reason: string } {
  if (!input.stagingBaseUrl?.trim()) {
    return {
      ok: false,
      reason:
        "E2E_STAGING_BASE_URL is not set — first green GitHub staging run requires staging URL secrets.",
    };
  }
  if (!input.loginEmail?.trim()) {
    return {
      ok: false,
      reason: "E2E_LOGIN_EMAIL is not set — staging E2E workflows require login credentials.",
    };
  }
  if (!input.loginPassword?.trim()) {
    return {
      ok: false,
      reason:
        "E2E_LOGIN_PASSWORD (or legacy E2E_PASSWORD) is not set — staging E2E workflows require login credentials.",
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

  return {
    version: STAGING_WORKFLOWS_FIRST_GREEN_SUMMARY_VERSION,
    runAt: new Date().toISOString(),
    overall: resolveStagingWorkflowFirstGreenOverall(steps),
    wiringCertPassed,
    stagingSecretsConfigured,
    stagingHealthChecked,
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
    "",
    ...summary.steps.map((step) => formatStagingWorkflowFirstGreenStepLine(step)),
  ];
}

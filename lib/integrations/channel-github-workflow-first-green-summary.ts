/**
 * Channel GitHub workflow first green summary — Evolution Era 17 Cycle 9.
 */

import {
  listMissingChannelLiveSmokeEnvVars,
  type ChannelLiveSmokePrerequisiteInput,
} from "@/lib/integrations/channel-live-smoke-summary";
import { normalizeGitHubRunOutcome } from "@/lib/ci/staging-workflows-first-green-summary";

export const CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_SUMMARY_VERSION =
  "era17-channel-github-workflow-first-green-v1" as const;

export type ChannelGitHubWorkflowFirstGreenStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type ChannelGitHubWorkflowFirstGreenStep = {
  id: string;
  label: string;
  status: ChannelGitHubWorkflowFirstGreenStepStatus;
  reason?: string;
};

export type ChannelGitHubWorkflowFirstGreenOverall = "PASSED" | "FAILED" | "SKIPPED";

export type ChannelGitHubWorkflowFirstGreenProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_missing_github_run"
  | "proof_failed";

export type ChannelGitHubWorkflowRunRecord = {
  workflowPath: string;
  runUrl: string | null;
  outcome: "PASSED" | "FAILED" | "SKIPPED" | null;
};

export type ChannelGitHubWorkflowFirstGreenSummary = {
  version: typeof CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_SUMMARY_VERSION;
  runAt: string;
  overall: ChannelGitHubWorkflowFirstGreenOverall;
  wiringCertPassed: boolean;
  channelSecretsConfigured: boolean;
  githubWorkflowProofStatus: ChannelGitHubWorkflowFirstGreenProofStatus;
  missingEnvVars: string[];
  githubRun: ChannelGitHubWorkflowRunRecord;
  steps: ChannelGitHubWorkflowFirstGreenStep[];
};

export function listMissingChannelGitHubWorkflowSecretEnvVars(
  input: ChannelLiveSmokePrerequisiteInput,
): string[] {
  return listMissingChannelLiveSmokeEnvVars(input);
}

export function formatMissingChannelGitHubWorkflowSecretEnvVarsReason(
  missingKeys: readonly string[],
): string {
  if (missingKeys.length === 0) {
    return "All channel GitHub workflow prerequisite secrets are configured.";
  }
  return `Missing GitHub secrets: ${missingKeys.join(", ")} — configure before workflow_dispatch proof.`;
}

export function evaluateChannelGitHubWorkflowSecretPrerequisites(
  input: ChannelLiveSmokePrerequisiteInput,
): { ok: true } | { ok: false; reason: string } {
  const missing = listMissingChannelGitHubWorkflowSecretEnvVars(input);
  if (missing.length > 0) {
    return {
      ok: false,
      reason: formatMissingChannelGitHubWorkflowSecretEnvVarsReason(missing),
    };
  }
  return { ok: true };
}

export function resolveChannelGitHubWorkflowFirstGreenProofStatus(input: {
  channelSecretsConfigured: boolean;
  githubOutcome: "PASSED" | "FAILED" | "SKIPPED" | null;
  githubRunUrl: string | null;
}): ChannelGitHubWorkflowFirstGreenProofStatus {
  if (!input.channelSecretsConfigured) return "proof_skipped_missing_prerequisites";
  if (input.githubOutcome === "FAILED") return "proof_failed";
  if (input.githubOutcome === "PASSED" && input.githubRunUrl) return "proof_passed";
  return "proof_skipped_missing_github_run";
}

export function formatChannelGitHubWorkflowFirstGreenStepLine(
  step: ChannelGitHubWorkflowFirstGreenStep,
): string {
  if (step.status === "SKIPPED") {
    return `[SKIPPED WITH REASON] ${step.label}: ${step.reason ?? "skipped"}`;
  }
  if (step.status === "FAILED") {
    return `[FAILED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
  }
  return `[PASSED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
}

export function resolveChannelGitHubWorkflowFirstGreenOverall(
  steps: readonly ChannelGitHubWorkflowFirstGreenStep[],
): ChannelGitHubWorkflowFirstGreenOverall {
  if (steps.some((step) => step.status === "FAILED")) return "FAILED";
  const actionable = steps.filter((step) => step.status !== "SKIPPED");
  if (actionable.length === 0) return "SKIPPED";
  if (actionable.every((step) => step.status === "PASSED")) return "PASSED";
  return "FAILED";
}

export function buildChannelGitHubWorkflowFirstGreenSummary(
  steps: readonly ChannelGitHubWorkflowFirstGreenStep[],
  input: {
    missingEnvVars: readonly string[];
    channelSecretsConfigured: boolean;
    githubRun: ChannelGitHubWorkflowRunRecord;
  },
  runAt: Date = new Date(),
): ChannelGitHubWorkflowFirstGreenSummary {
  const wiringCertPassed = steps.some(
    (step) => step.id === "wiring_cert" && step.status === "PASSED",
  );

  return {
    version: CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_SUMMARY_VERSION,
    runAt: runAt.toISOString(),
    overall: resolveChannelGitHubWorkflowFirstGreenOverall(steps),
    wiringCertPassed,
    channelSecretsConfigured: input.channelSecretsConfigured,
    githubWorkflowProofStatus: resolveChannelGitHubWorkflowFirstGreenProofStatus({
      channelSecretsConfigured: input.channelSecretsConfigured,
      githubOutcome: input.githubRun.outcome,
      githubRunUrl: input.githubRun.runUrl,
    }),
    missingEnvVars: [...input.missingEnvVars],
    githubRun: input.githubRun,
    steps: [...steps],
  };
}

export function formatChannelGitHubWorkflowFirstGreenReportLines(
  summary: ChannelGitHubWorkflowFirstGreenSummary,
): string[] {
  return [
    `Channel GitHub workflow first green (${summary.version}) — overall: ${summary.overall}`,
    `Run at: ${summary.runAt}`,
    `Wiring cert: ${summary.wiringCertPassed ? "passed" : "not passed"}`,
    `Channel secrets: ${summary.channelSecretsConfigured ? "configured" : "missing or skipped"}`,
    `GitHub workflow proof status: ${summary.githubWorkflowProofStatus}`,
    `GitHub run URL: ${summary.githubRun.runUrl ?? "not recorded"}`,
    `GitHub outcome: ${summary.githubRun.outcome ?? "not recorded"}`,
    summary.missingEnvVars.length > 0
      ? `Missing env vars: ${summary.missingEnvVars.join(", ")}`
      : "Missing env vars: none",
    "",
    ...summary.steps.map((step) => formatChannelGitHubWorkflowFirstGreenStepLine(step)),
  ];
}

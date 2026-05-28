/**
 * Operational sign-off staging proof summary — Evolution Era 17 Workstream F Cycle 26.
 */

import { evaluateOperationalSignOffManualPrerequisites } from "@/lib/operations/operational-signoff-summary";

import { OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_POLICY_ID } from "@/lib/operations/operational-signoff-staging-proof-era17-policy";

export const OPERATIONAL_SIGNOFF_STAGING_PROOF_SUMMARY_VERSION =
  OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_POLICY_ID;

export type OperationalSignOffStagingProofStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type OperationalSignOffStagingProofStep = {
  id: string;
  label: string;
  status: OperationalSignOffStagingProofStepStatus;
  reason?: string;
};

export type OperationalSignOffStagingProofOverall = "PASSED" | "FAILED" | "SKIPPED";

export type OperationalSignOffStagingProofStatus =
  | "proof_passed"
  | "proof_failed"
  | "proof_partial"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_staging_unreachable";

export type OperationalSignOffStagingProofSummary = {
  version: typeof OPERATIONAL_SIGNOFF_STAGING_PROOF_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: OperationalSignOffStagingProofOverall;
  stagingProofStatus: OperationalSignOffStagingProofStatus;
  stagingUrl: string | null;
  operatorEmail: string | null;
  missingEnvVars: string[];
  kdsManualSignOff: "pending" | "passed" | "skipped";
  productionCalendarManualSignOff: "pending" | "passed" | "skipped";
  steps: OperationalSignOffStagingProofStep[];
};

export type OperationalSignOffStagingProofInput = {
  stagingUrl: string | null;
  operatorEmail: string | null;
  kdsManual: string | null;
  productionCalendarManual: string | null;
};

export function listMissingOperationalSignOffStagingProofEnvVars(
  input: OperationalSignOffStagingProofInput,
): string[] {
  const missing: string[] = [];
  if (!input.stagingUrl?.trim()) missing.push("OPERATIONAL_SIGNOFF_STAGING_URL");
  if (!input.operatorEmail?.trim()) missing.push("OPERATIONAL_SIGNOFF_OPERATOR_EMAIL");
  return missing;
}

export function formatMissingOperationalSignOffStagingProofEnvVarsReason(
  missing: readonly string[],
): string {
  if (missing.length === 0) return "All prerequisite env vars set.";
  return `Missing: ${missing.join(", ")}.`;
}

export function normalizeManualSignOffState(
  raw: string | null | undefined,
): "pending" | "passed" | "skipped" {
  const value = raw?.trim().toLowerCase();
  if (value === "passed" || value === "pass") return "passed";
  if (value === "skipped" || value === "skip") return "skipped";
  return "pending";
}

export function resolveOperationalSignOffStagingProofStatus(input: {
  prerequisitesMet: boolean;
  wiringCertPassed: boolean;
  stagingHealthPassed: boolean;
  stagingHealthSkipped: boolean;
  kdsManual: "pending" | "passed" | "skipped";
  productionCalendarManual: "pending" | "passed" | "skipped";
  githubFailed: boolean;
}): OperationalSignOffStagingProofStatus {
  if (input.githubFailed || !input.wiringCertPassed) return "proof_failed";
  if (!input.prerequisitesMet) return "proof_skipped_missing_prerequisites";
  if (!input.stagingHealthPassed && !input.stagingHealthSkipped) {
    return "proof_skipped_staging_unreachable";
  }
  if (input.kdsManual === "passed" && input.productionCalendarManual === "passed") {
    return "proof_passed";
  }
  return "proof_partial";
}

export function formatOperationalSignOffStagingProofStepLine(
  step: OperationalSignOffStagingProofStep,
): string {
  if (step.status === "SKIPPED") {
    return `[SKIPPED WITH REASON] ${step.label}: ${step.reason ?? "skipped"}`;
  }
  if (step.status === "FAILED") {
    return `[FAILED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
  }
  return `[PASSED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
}

export function resolveOperationalSignOffStagingProofOverall(
  steps: readonly OperationalSignOffStagingProofStep[],
): OperationalSignOffStagingProofOverall {
  if (steps.some((step) => step.status === "FAILED")) return "FAILED";
  const actionable = steps.filter((step) => step.status !== "SKIPPED");
  if (actionable.length === 0) return "SKIPPED";
  if (actionable.every((step) => step.status === "PASSED")) return "PASSED";
  return "FAILED";
}

export function buildOperationalSignOffStagingProofSummary(
  steps: readonly OperationalSignOffStagingProofStep[],
  input?: {
    commitSha?: string | null;
    missingEnvVars?: readonly string[];
    stagingUrl?: string | null;
    operatorEmail?: string | null;
    kdsManual?: "pending" | "passed" | "skipped";
    productionCalendarManual?: "pending" | "passed" | "skipped";
  },
  runAt: Date = new Date(),
): OperationalSignOffStagingProofSummary {
  const wiringCertPassed = steps.some(
    (step) => step.id === "wiring_cert" && step.status === "PASSED",
  );
  const prerequisitesMet = (input?.missingEnvVars?.length ?? 0) === 0;
  const stagingHealthStep = steps.find((step) => step.id === "staging_health");
  const stagingHealthPassed = stagingHealthStep?.status === "PASSED";
  const stagingHealthSkipped = stagingHealthStep?.status === "SKIPPED";
  const kdsManual = input?.kdsManual ?? "skipped";
  const productionCalendarManual = input?.productionCalendarManual ?? "skipped";

  return {
    version: OPERATIONAL_SIGNOFF_STAGING_PROOF_SUMMARY_VERSION,
    runAt: runAt.toISOString(),
    commitSha: input?.commitSha?.trim() || null,
    overall: resolveOperationalSignOffStagingProofOverall(steps),
    stagingProofStatus: resolveOperationalSignOffStagingProofStatus({
      prerequisitesMet,
      wiringCertPassed,
      stagingHealthPassed,
      stagingHealthSkipped,
      kdsManual,
      productionCalendarManual,
      githubFailed: false,
    }),
    stagingUrl: input?.stagingUrl?.trim() || null,
    operatorEmail: input?.operatorEmail?.trim() || null,
    missingEnvVars: [...(input?.missingEnvVars ?? [])],
    kdsManualSignOff: kdsManual,
    productionCalendarManualSignOff: productionCalendarManual,
    steps: [...steps],
  };
}

export function formatOperationalSignOffStagingProofReportLines(
  summary: OperationalSignOffStagingProofSummary,
): string[] {
  return [
    `Operational sign-off staging proof (${summary.version}) — overall: ${summary.overall}`,
    `Run at: ${summary.runAt}`,
    `Commit SHA: ${summary.commitSha ?? "not recorded"}`,
    `Staging proof status: ${summary.stagingProofStatus}`,
    `Staging URL: ${summary.stagingUrl ?? "not recorded"}`,
    `Operator: ${summary.operatorEmail ?? "not recorded"}`,
    `KDS manual: ${summary.kdsManualSignOff}`,
    `Production calendar manual: ${summary.productionCalendarManualSignOff}`,
    "",
    ...summary.steps.map((step) => formatOperationalSignOffStagingProofStepLine(step)),
  ];
}

export function evaluateOperationalSignOffStagingProofPrerequisites(
  input: OperationalSignOffStagingProofInput,
): { ok: true } | { ok: false; reason: string } {
  const manual = evaluateOperationalSignOffManualPrerequisites({
    stagingUrl: input.stagingUrl,
    operatorEmail: input.operatorEmail,
  });
  if (!manual.ok) return manual;
  return { ok: true };
}

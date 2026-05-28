/**
 * Production calendar operator drill summary — Evolution Era 17 Workstream F Cycle 27.
 */

import { PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_POLICY_ID } from "@/lib/production/production-calendar-operator-drill-era17-policy";

export const PRODUCTION_CALENDAR_OPERATOR_DRILL_SUMMARY_VERSION =
  PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_POLICY_ID;

export type ProductionCalendarOperatorDrillStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type ProductionCalendarOperatorDrillStep = {
  id: string;
  label: string;
  status: ProductionCalendarOperatorDrillStepStatus;
  reason?: string;
};

export type ProductionCalendarOperatorDrillOverall = "PASSED" | "FAILED" | "SKIPPED";

export type ProductionCalendarOperatorDrillProofStatus =
  | "proof_passed"
  | "proof_failed"
  | "proof_partial"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_staging_unreachable";

export type ProductionCalendarOperatorDrillSummary = {
  version: typeof PRODUCTION_CALENDAR_OPERATOR_DRILL_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: ProductionCalendarOperatorDrillOverall;
  drillProofStatus: ProductionCalendarOperatorDrillProofStatus;
  stagingUrl: string | null;
  operatorEmail: string | null;
  manualAttestation: "pending" | "passed" | "skipped";
  missingEnvVars: string[];
  steps: ProductionCalendarOperatorDrillStep[];
};

export type ProductionCalendarOperatorDrillInput = {
  stagingUrl: string | null;
  operatorEmail: string | null;
  manualAttestation: string | null;
};

export function listMissingProductionCalendarOperatorDrillEnvVars(
  input: Pick<ProductionCalendarOperatorDrillInput, "stagingUrl" | "operatorEmail">,
): string[] {
  const missing: string[] = [];
  if (!input.stagingUrl?.trim()) missing.push("PRODUCTION_CALENDAR_DRILL_STAGING_URL");
  if (!input.operatorEmail?.trim()) missing.push("PRODUCTION_CALENDAR_DRILL_OPERATOR_EMAIL");
  return missing;
}

export function formatMissingProductionCalendarOperatorDrillEnvVarsReason(
  missing: readonly string[],
): string {
  if (missing.length === 0) return "All prerequisite env vars set.";
  return `Missing: ${missing.join(", ")}.`;
}

export function normalizeProductionCalendarDrillManualAttestation(
  raw: string | null | undefined,
): "pending" | "passed" | "skipped" {
  const value = raw?.trim().toLowerCase();
  if (value === "passed" || value === "pass") return "passed";
  if (value === "skipped" || value === "skip") return "skipped";
  return "pending";
}

export function resolveProductionCalendarOperatorDrillProofStatus(input: {
  prerequisitesMet: boolean;
  wiringCertPassed: boolean;
  stagingHealthPassed: boolean;
  stagingHealthSkipped: boolean;
  manualAttestation: "pending" | "passed" | "skipped";
}): ProductionCalendarOperatorDrillProofStatus {
  if (!input.wiringCertPassed) return "proof_failed";
  if (!input.prerequisitesMet) return "proof_skipped_missing_prerequisites";
  if (!input.stagingHealthPassed && !input.stagingHealthSkipped) {
    return "proof_skipped_staging_unreachable";
  }
  if (input.manualAttestation === "passed") return "proof_passed";
  return "proof_partial";
}

export function formatProductionCalendarOperatorDrillStepLine(
  step: ProductionCalendarOperatorDrillStep,
): string {
  if (step.status === "SKIPPED") {
    return `[SKIPPED WITH REASON] ${step.label}: ${step.reason ?? "skipped"}`;
  }
  if (step.status === "FAILED") {
    return `[FAILED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
  }
  return `[PASSED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
}

export function resolveProductionCalendarOperatorDrillOverall(
  steps: readonly ProductionCalendarOperatorDrillStep[],
): ProductionCalendarOperatorDrillOverall {
  if (steps.some((step) => step.status === "FAILED")) return "FAILED";
  const actionable = steps.filter((step) => step.status !== "SKIPPED");
  if (actionable.length === 0) return "SKIPPED";
  if (actionable.every((step) => step.status === "PASSED")) return "PASSED";
  return "FAILED";
}

export function buildProductionCalendarOperatorDrillSummary(
  steps: readonly ProductionCalendarOperatorDrillStep[],
  input?: {
    commitSha?: string | null;
    missingEnvVars?: readonly string[];
    stagingUrl?: string | null;
    operatorEmail?: string | null;
    manualAttestation?: "pending" | "passed" | "skipped";
  },
  runAt: Date = new Date(),
): ProductionCalendarOperatorDrillSummary {
  const wiringCertPassed = steps.some(
    (step) => step.id === "wiring_cert" && step.status === "PASSED",
  );
  const prerequisitesMet = (input?.missingEnvVars?.length ?? 0) === 0;
  const stagingHealthStep = steps.find((step) => step.id === "staging_health");
  const stagingHealthPassed = stagingHealthStep?.status === "PASSED";
  const stagingHealthSkipped = stagingHealthStep?.status === "SKIPPED";
  const manualAttestation = input?.manualAttestation ?? "skipped";

  return {
    version: PRODUCTION_CALENDAR_OPERATOR_DRILL_SUMMARY_VERSION,
    runAt: runAt.toISOString(),
    commitSha: input?.commitSha?.trim() || null,
    overall: resolveProductionCalendarOperatorDrillOverall(steps),
    drillProofStatus: resolveProductionCalendarOperatorDrillProofStatus({
      prerequisitesMet,
      wiringCertPassed,
      stagingHealthPassed,
      stagingHealthSkipped,
      manualAttestation,
    }),
    stagingUrl: input?.stagingUrl?.trim() || null,
    operatorEmail: input?.operatorEmail?.trim() || null,
    manualAttestation,
    missingEnvVars: [...(input?.missingEnvVars ?? [])],
    steps: [...steps],
  };
}

export function formatProductionCalendarOperatorDrillReportLines(
  summary: ProductionCalendarOperatorDrillSummary,
): string[] {
  return [
    `Production calendar operator drill (${summary.version}) — overall: ${summary.overall}`,
    `Run at: ${summary.runAt}`,
    `Commit SHA: ${summary.commitSha ?? "not recorded"}`,
    `Drill proof status: ${summary.drillProofStatus}`,
    `Staging URL: ${summary.stagingUrl ?? "not recorded"}`,
    `Operator: ${summary.operatorEmail ?? "not recorded"}`,
    `Manual attestation: ${summary.manualAttestation}`,
    "",
    ...summary.steps.map((step) => formatProductionCalendarOperatorDrillStepLine(step)),
  ];
}

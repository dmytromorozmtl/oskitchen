/**
 * Operational sign-off summary — Evolution Era 16 Cycle 10.
 *
 * Unified PASSED / FAILED / SKIPPED WITH REASON for KDS + production calendar ops.
 */

export const OPERATIONAL_SIGNOFF_SUMMARY_VERSION = "era16-operational-signoff-v1" as const;

export type OperationalSignOffStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type OperationalSignOffStep = {
  id: string;
  label: string;
  status: OperationalSignOffStepStatus;
  reason?: string;
};

export type OperationalSignOffOverall = "PASSED" | "FAILED" | "SKIPPED";

export type OperationalSignOffManualState = "pending" | "passed" | "skipped";

export type OperationalSignOffTemplate = {
  environmentUrl: string | null;
  commitSha: string | null;
  operatorEmail: string | null;
  pilotTenantId: string | null;
  kdsManualSignOff: OperationalSignOffManualState;
  productionCalendarManualSignOff: OperationalSignOffManualState;
  notes: string | null;
};

export type OperationalSignOffSummary = {
  version: typeof OPERATIONAL_SIGNOFF_SUMMARY_VERSION;
  runAt: string;
  overall: OperationalSignOffOverall;
  signOffTemplate: OperationalSignOffTemplate;
  steps: OperationalSignOffStep[];
};

export type OperationalSignOffManualInput = {
  stagingUrl?: string | null;
  operatorEmail?: string | null;
  pilotTenantId?: string | null;
  commitSha?: string | null;
  notes?: string | null;
};

export function evaluateOperationalSignOffManualPrerequisites(
  input: OperationalSignOffManualInput,
): { ok: true } | { ok: false; reason: string } {
  if (!input.stagingUrl?.trim()) {
    return {
      ok: false,
      reason:
        "OPERATIONAL_SIGNOFF_STAGING_URL is not set — manual staging UI sign-off must be completed separately.",
    };
  }
  if (!input.operatorEmail?.trim()) {
    return {
      ok: false,
      reason:
        "OPERATIONAL_SIGNOFF_OPERATOR_EMAIL is not set — record operator identity before manual sign-off.",
    };
  }
  return { ok: true };
}

export function formatOperationalSignOffStepLine(step: OperationalSignOffStep): string {
  if (step.status === "SKIPPED") {
    return `[SKIPPED WITH REASON] ${step.label}: ${step.reason ?? "skipped"}`;
  }
  if (step.status === "FAILED") {
    return `[FAILED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
  }
  return `[PASSED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
}

export function resolveOperationalSignOffOverall(
  steps: readonly OperationalSignOffStep[],
): OperationalSignOffOverall {
  if (steps.some((step) => step.status === "FAILED")) return "FAILED";
  const actionable = steps.filter((step) => step.status !== "SKIPPED");
  if (actionable.length === 0) return "SKIPPED";
  if (actionable.every((step) => step.status === "PASSED")) return "PASSED";
  return "FAILED";
}

export function buildOperationalSignOffTemplate(
  input: OperationalSignOffManualInput,
  manualReady: boolean,
): OperationalSignOffTemplate {
  return {
    environmentUrl: input.stagingUrl?.trim() || null,
    commitSha: input.commitSha?.trim() || null,
    operatorEmail: input.operatorEmail?.trim() || null,
    pilotTenantId: input.pilotTenantId?.trim() || null,
    kdsManualSignOff: manualReady ? "pending" : "skipped",
    productionCalendarManualSignOff: manualReady ? "pending" : "skipped",
    notes: input.notes?.trim() || null,
  };
}

export function buildOperationalSignOffSummary(
  steps: readonly OperationalSignOffStep[],
  signOffTemplate: OperationalSignOffTemplate,
): OperationalSignOffSummary {
  return {
    version: OPERATIONAL_SIGNOFF_SUMMARY_VERSION,
    runAt: new Date().toISOString(),
    overall: resolveOperationalSignOffOverall(steps),
    signOffTemplate,
    steps: [...steps],
  };
}

export function formatOperationalSignOffSummaryLines(summary: OperationalSignOffSummary): string[] {
  const lines = [
    `Operational sign-off (${summary.version}) — overall: ${summary.overall}`,
    `Run at: ${summary.runAt}`,
    "",
    "Steps:",
    ...summary.steps.map((step) => `  ${formatOperationalSignOffStepLine(step)}`),
    "",
    "Sign-off template:",
    `  Environment: ${summary.signOffTemplate.environmentUrl ?? "(not recorded)"}`,
    `  Operator: ${summary.signOffTemplate.operatorEmail ?? "(not recorded)"}`,
    `  Commit: ${summary.signOffTemplate.commitSha ?? "(not recorded)"}`,
    `  KDS manual: ${summary.signOffTemplate.kdsManualSignOff}`,
    `  Production calendar manual: ${summary.signOffTemplate.productionCalendarManualSignOff}`,
  ];
  if (summary.signOffTemplate.notes) {
    lines.push(`  Notes: ${summary.signOffTemplate.notes}`);
  }
  return lines;
}

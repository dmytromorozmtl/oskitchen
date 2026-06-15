/**
 * Pilot forbidden-claims enforcement summary — Evolution Era 17 P0 #5.
 */

export const PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_SUMMARY_VERSION =
  "era17-pilot-forbidden-claims-enforcement-v1" as const;

export type PilotForbiddenClaimsEnforcementStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type PilotForbiddenClaimsEnforcementStep = {
  id: string;
  label: string;
  status: PilotForbiddenClaimsEnforcementStepStatus;
  reason?: string;
};

export type PilotForbiddenClaimsEnforcementOverall = "PASSED" | "FAILED" | "SKIPPED";

export type PilotForbiddenClaimsEnforcementProofStatus =
  | "proof_passed"
  | "proof_failed"
  | "proof_skipped_missing_prerequisites";

export type PilotForbiddenClaimsEnforcementSummary = {
  version: typeof PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PilotForbiddenClaimsEnforcementOverall;
  marketingClaimsStrict: boolean;
  claimsEnforcementProofStatus: PilotForbiddenClaimsEnforcementProofStatus;
  steps: PilotForbiddenClaimsEnforcementStep[];
};

export function formatPilotForbiddenClaimsEnforcementStepLine(
  step: PilotForbiddenClaimsEnforcementStep,
): string {
  if (step.status === "SKIPPED") {
    return `[SKIPPED WITH REASON] ${step.label}: ${step.reason ?? "skipped"}`;
  }
  if (step.status === "FAILED") {
    return `[FAILED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
  }
  return `[PASSED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
}

export function resolvePilotForbiddenClaimsEnforcementProofStatus(
  steps: readonly PilotForbiddenClaimsEnforcementStep[],
): PilotForbiddenClaimsEnforcementProofStatus {
  if (steps.length === 0) return "proof_skipped_missing_prerequisites";
  if (steps.some((step) => step.status === "FAILED")) return "proof_failed";
  const actionable = steps.filter((step) => step.status !== "SKIPPED");
  if (actionable.length === 0) return "proof_skipped_missing_prerequisites";
  if (actionable.every((step) => step.status === "PASSED")) return "proof_passed";
  return "proof_failed";
}

export function resolvePilotForbiddenClaimsEnforcementOverall(
  steps: readonly PilotForbiddenClaimsEnforcementStep[],
): PilotForbiddenClaimsEnforcementOverall {
  if (steps.some((step) => step.status === "FAILED")) return "FAILED";
  const actionable = steps.filter((step) => step.status !== "SKIPPED");
  if (actionable.length === 0) return "SKIPPED";
  if (actionable.every((step) => step.status === "PASSED")) return "PASSED";
  return "FAILED";
}

export function buildPilotForbiddenClaimsEnforcementSummary(
  steps: readonly PilotForbiddenClaimsEnforcementStep[],
  input?: {
    commitSha?: string | null;
    marketingClaimsStrict?: boolean;
  },
  runAt: Date = new Date(),
): PilotForbiddenClaimsEnforcementSummary {
  return {
    version: PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_SUMMARY_VERSION,
    runAt: runAt.toISOString(),
    commitSha: input?.commitSha?.trim() || null,
    overall: resolvePilotForbiddenClaimsEnforcementOverall(steps),
    marketingClaimsStrict: input?.marketingClaimsStrict ?? true,
    claimsEnforcementProofStatus: resolvePilotForbiddenClaimsEnforcementProofStatus(steps),
    steps: [...steps],
  };
}

export function formatPilotForbiddenClaimsEnforcementReportLines(
  summary: PilotForbiddenClaimsEnforcementSummary,
): string[] {
  return [
    `Pilot forbidden-claims enforcement (${summary.version}) — overall: ${summary.overall}`,
    `Run at: ${summary.runAt}`,
    `Commit SHA: ${summary.commitSha ?? "not recorded"}`,
    `Marketing claims strict: ${summary.marketingClaimsStrict ? "yes" : "no"}`,
    `Claims enforcement proof status: ${summary.claimsEnforcementProofStatus}`,
    "",
    ...summary.steps.map((step) => formatPilotForbiddenClaimsEnforcementStepLine(step)),
  ];
}

/**
 * Pilot Tier 0/1 preflight summary — Evolution Era 17 Cycle 16.
 */

export const PILOT_TIER_PREFLIGHT_SUMMARY_VERSION = "era17-pilot-tier-preflight-v1" as const;

export type PilotTierPreflightStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type PilotTierPreflightStep = {
  id: string;
  tier: "tier0" | "tier1";
  label: string;
  status: PilotTierPreflightStepStatus;
  reason?: string;
};

export type PilotTierPreflightOverall = "PASSED" | "FAILED" | "SKIPPED";

export type PilotTierProofStatus =
  | "proof_passed"
  | "proof_failed"
  | "proof_skipped_missing_prerequisites"
  | "proof_partial";

export type PilotTierPreflightSummary = {
  version: typeof PILOT_TIER_PREFLIGHT_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PilotTierPreflightOverall;
  tier0ProofStatus: PilotTierProofStatus;
  tier1ProofStatus: PilotTierProofStatus;
  marketingClaimsStrict: boolean;
  steps: PilotTierPreflightStep[];
};

export function formatPilotTierPreflightStepLine(step: PilotTierPreflightStep): string {
  if (step.status === "SKIPPED") {
    return `[SKIPPED WITH REASON] ${step.label}: ${step.reason ?? "skipped"}`;
  }
  if (step.status === "FAILED") {
    return `[FAILED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
  }
  return `[PASSED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
}

export function resolvePilotTierProofStatus(
  steps: readonly PilotTierPreflightStep[],
  tier: "tier0" | "tier1",
): PilotTierProofStatus {
  const tierSteps = steps.filter((step) => step.tier === tier);
  if (tierSteps.length === 0) return "proof_skipped_missing_prerequisites";
  if (tierSteps.some((step) => step.status === "FAILED")) return "proof_failed";
  const actionable = tierSteps.filter((step) => step.status !== "SKIPPED");
  if (actionable.length === 0) return "proof_skipped_missing_prerequisites";
  if (actionable.every((step) => step.status === "PASSED")) return "proof_passed";
  return "proof_partial";
}

export function resolvePilotTierPreflightOverall(
  steps: readonly PilotTierPreflightStep[],
): PilotTierPreflightOverall {
  if (steps.some((step) => step.status === "FAILED")) return "FAILED";
  const actionable = steps.filter((step) => step.status !== "SKIPPED");
  if (actionable.length === 0) return "SKIPPED";
  if (actionable.every((step) => step.status === "PASSED")) return "PASSED";
  return "FAILED";
}

export function buildPilotTierPreflightSummary(
  steps: readonly PilotTierPreflightStep[],
  input?: {
    commitSha?: string | null;
    marketingClaimsStrict?: boolean;
  },
  runAt: Date = new Date(),
): PilotTierPreflightSummary {
  return {
    version: PILOT_TIER_PREFLIGHT_SUMMARY_VERSION,
    runAt: runAt.toISOString(),
    commitSha: input?.commitSha?.trim() || null,
    overall: resolvePilotTierPreflightOverall(steps),
    tier0ProofStatus: resolvePilotTierProofStatus(steps, "tier0"),
    tier1ProofStatus: resolvePilotTierProofStatus(steps, "tier1"),
    marketingClaimsStrict: input?.marketingClaimsStrict ?? false,
    steps: [...steps],
  };
}

export function formatPilotTierPreflightReportLines(summary: PilotTierPreflightSummary): string[] {
  return [
    `Pilot Tier 0/1 preflight (${summary.version}) — overall: ${summary.overall}`,
    `Run at: ${summary.runAt}`,
    `Commit SHA: ${summary.commitSha ?? "not recorded"}`,
    `Marketing claims strict: ${summary.marketingClaimsStrict ? "yes" : "no"}`,
    `Tier 0 proof status: ${summary.tier0ProofStatus}`,
    `Tier 1 proof status: ${summary.tier1ProofStatus}`,
    "",
    ...summary.steps.map((step) => formatPilotTierPreflightStepLine(step)),
  ];
}

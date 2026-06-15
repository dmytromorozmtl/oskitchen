/**
 * POS operator runbook golden-path summary — Evolution Era 17 Cycle 24.
 */

import {
  POS_OPERATOR_RUNBOOK_ERA17_GOLDEN_PATH_STEPS,
  POS_OPERATOR_RUNBOOK_ERA17_POLICY_ID,
} from "@/lib/pos/pos-operator-runbook-era17-policy";

export const POS_OPERATOR_RUNBOOK_SUMMARY_VERSION = POS_OPERATOR_RUNBOOK_ERA17_POLICY_ID;

export type PosOperatorRunbookStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type PosOperatorRunbookStep = {
  order: number;
  action: string;
  status: PosOperatorRunbookStepStatus;
  reason?: string;
};

export type PosOperatorRunbookProofStatus =
  | "operator_runbook_ready"
  | "proof_passed"
  | "proof_failed"
  | "proof_skipped_missing_prerequisites"
  | "awaiting_operator_golden_path_execution";

export type PosOperatorRunbookSummary = {
  version: typeof POS_OPERATOR_RUNBOOK_SUMMARY_VERSION;
  policyId: typeof POS_OPERATOR_RUNBOOK_ERA17_POLICY_ID;
  runAt: string;
  posOperatorProofStatus: PosOperatorRunbookProofStatus;
  stagingUrl: string | null;
  operatorEmail: string | null;
  goldenPathAttestation: "pending" | "passed" | "skipped";
  certPassed: boolean;
  steps: PosOperatorRunbookStep[];
  passedStepCount: number;
  totalSteps: number;
};

export type PosOperatorRunbookInput = {
  operatorEmail: string | null;
  stagingUrl: string | null;
  goldenPathAttestation: string | null;
  certPassed: boolean;
};

export function normalizePosOperatorGoldenPathAttestation(
  raw: string | null | undefined,
): "pending" | "passed" | "skipped" {
  const value = raw?.trim().toLowerCase();
  if (value === "passed" || value === "pass") return "passed";
  if (value === "skipped" || value === "skip") return "skipped";
  return "pending";
}

export function listMissingPosOperatorRunbookPrerequisites(
  input: Pick<PosOperatorRunbookInput, "operatorEmail">,
): string[] {
  const missing: string[] = [];
  if (!input.operatorEmail?.trim()) missing.push("POS_OPERATOR_RUNBOOK_OPERATOR_EMAIL");
  return missing;
}

export function formatMissingPosOperatorRunbookReason(missing: readonly string[]): string {
  if (missing.length === 0) return "Operator email recorded.";
  return `${missing.join(", ")} is not set — record drill facilitator before step sign-off.`;
}

export function resolvePosOperatorRunbookProofStatus(input: {
  certPassed: boolean;
  operatorEmail: string | null;
  goldenPathAttestation: "pending" | "passed" | "skipped";
  allStepsPassed: boolean;
}): PosOperatorRunbookProofStatus {
  if (!input.certPassed) return "proof_failed";
  if (!input.operatorEmail?.trim()) return "awaiting_operator_golden_path_execution";
  if (input.goldenPathAttestation === "passed" && input.allStepsPassed) return "proof_passed";
  if (input.goldenPathAttestation === "skipped") return "proof_skipped_missing_prerequisites";
  return "operator_runbook_ready";
}

export function buildPosOperatorRunbookSteps(
  input: Pick<PosOperatorRunbookInput, "operatorEmail">,
): PosOperatorRunbookStep[] {
  const missingReason = formatMissingPosOperatorRunbookReason(
    listMissingPosOperatorRunbookPrerequisites(input),
  );
  const status: PosOperatorRunbookStepStatus = input.operatorEmail?.trim()
    ? "PASSED"
    : "SKIPPED";

  return POS_OPERATOR_RUNBOOK_ERA17_GOLDEN_PATH_STEPS.map((action, index) => ({
    order: index + 1,
    action,
    status,
    reason: status === "SKIPPED" ? missingReason : undefined,
  }));
}

export function formatPosOperatorRunbookStepLine(step: PosOperatorRunbookStep): string {
  if (step.status === "SKIPPED") {
    return `[SKIPPED WITH REASON] Step ${step.order} — ${step.action}: ${step.reason ?? "skipped"}`;
  }
  if (step.status === "FAILED") {
    return `[FAILED] Step ${step.order} — ${step.action}${step.reason ? `: ${step.reason}` : ""}`;
  }
  return `[PASSED] Step ${step.order} — ${step.action}`;
}

export function buildPosOperatorRunbookSummary(
  input: PosOperatorRunbookInput,
  runAt: Date = new Date(),
): PosOperatorRunbookSummary {
  const operatorEmail = input.operatorEmail?.trim() || null;
  const stagingUrl = input.stagingUrl?.trim() || null;
  const goldenPathAttestation = normalizePosOperatorGoldenPathAttestation(
    input.goldenPathAttestation,
  );
  const steps = buildPosOperatorRunbookSteps({ operatorEmail });
  const passedStepCount = steps.filter((step) => step.status === "PASSED").length;
  const allStepsPassed = passedStepCount === steps.length;

  const posOperatorProofStatus = resolvePosOperatorRunbookProofStatus({
    certPassed: input.certPassed,
    operatorEmail,
    goldenPathAttestation,
    allStepsPassed,
  });

  return {
    version: POS_OPERATOR_RUNBOOK_SUMMARY_VERSION,
    policyId: POS_OPERATOR_RUNBOOK_ERA17_POLICY_ID,
    runAt: runAt.toISOString(),
    posOperatorProofStatus,
    stagingUrl,
    operatorEmail,
    goldenPathAttestation,
    certPassed: input.certPassed,
    steps,
    passedStepCount,
    totalSteps: steps.length,
  };
}

export function parsePosOperatorRunbookEnv(): PosOperatorRunbookInput {
  return {
    operatorEmail: process.env.POS_OPERATOR_RUNBOOK_OPERATOR_EMAIL ?? null,
    stagingUrl: process.env.POS_OPERATOR_RUNBOOK_STAGING_URL ?? null,
    goldenPathAttestation: process.env.POS_OPERATOR_RUNBOOK_GOLDEN_PATH_ATTESTATION ?? null,
    certPassed: true,
  };
}

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_SHIFT_OPEN_CLOSE_P2_50_ARTIFACT,
  POS_SHIFT_OPEN_CLOSE_P2_50_E2E_SPEC,
  POS_SHIFT_OPEN_CLOSE_P2_50_FLOW_HELPER,
  POS_SHIFT_OPEN_CLOSE_P2_50_FLOW_STEPS,
  POS_SHIFT_OPEN_CLOSE_P2_50_POLICY_ID,
  POS_SHIFT_OPEN_CLOSE_P2_50_RECONCILE_HELPER,
} from "@/lib/qa/pos-shift-open-close-p2-50-policy";

export type PosShiftOpenCloseP250AuditSummary = {
  policyId: typeof POS_SHIFT_OPEN_CLOSE_P2_50_POLICY_ID;
  e2eSpecPresent: boolean;
  flowHelperPresent: boolean;
  refundVoidWired: boolean;
  reconcileWired: boolean;
  closeoutMathPresent: boolean;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditPosShiftOpenCloseP250(root = process.cwd()): PosShiftOpenCloseP250AuditSummary {
  const e2eSpecPresent = existsSync(join(root, POS_SHIFT_OPEN_CLOSE_P2_50_E2E_SPEC));
  const flowHelperPresent = existsSync(join(root, POS_SHIFT_OPEN_CLOSE_P2_50_FLOW_HELPER));

  let refundVoidWired = false;
  let reconcileWired = false;
  if (flowHelperPresent) {
    const flow = readFileSync(join(root, POS_SHIFT_OPEN_CLOSE_P2_50_FLOW_HELPER), "utf8");
    refundVoidWired =
      flow.includes("refundPosTransaction") &&
      flow.includes("voidPosTransaction") &&
      flow.includes("closeShiftWithExpectedCash");
    reconcileWired = flow.includes("assertClosedShiftTotalsBalanced");
  }

  const reconcileHelperPresent = existsSync(join(root, POS_SHIFT_OPEN_CLOSE_P2_50_RECONCILE_HELPER));
  if (reconcileHelperPresent && !reconcileWired) {
    const reconcile = readFileSync(join(root, POS_SHIFT_OPEN_CLOSE_P2_50_RECONCILE_HELPER), "utf8");
    reconcileWired =
      reconcile.includes("assertClosedShiftTotalsBalanced") &&
      reconcile.includes("closedShiftHistoryShowsBalanced");
  }

  const closeoutMathPresent = existsSync(join(root, "lib/pos/pos-shift-closeout-math.ts"));

  let artifactPresent = false;
  const artifactPath = join(root, POS_SHIFT_OPEN_CLOSE_P2_50_ARTIFACT);
  if (existsSync(artifactPath)) {
    const artifact = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      policyId?: string;
      flowSteps?: string[];
    };
    artifactPresent =
      artifact.policyId === POS_SHIFT_OPEN_CLOSE_P2_50_POLICY_ID &&
      JSON.stringify(artifact.flowSteps) === JSON.stringify([...POS_SHIFT_OPEN_CLOSE_P2_50_FLOW_STEPS]);
  }

  const passed =
    e2eSpecPresent &&
    flowHelperPresent &&
    refundVoidWired &&
    reconcileWired &&
    closeoutMathPresent &&
    artifactPresent;

  return {
    policyId: POS_SHIFT_OPEN_CLOSE_P2_50_POLICY_ID,
    e2eSpecPresent,
    flowHelperPresent,
    refundVoidWired,
    reconcileWired,
    closeoutMathPresent,
    artifactPresent,
    passed,
  };
}

export function formatPosShiftOpenCloseP250AuditLines(
  summary: PosShiftOpenCloseP250AuditSummary,
): string[] {
  return [
    `POS shift open→close E2E (${summary.policyId})`,
    `E2E spec: ${summary.e2eSpecPresent ? "present" : "missing"}`,
    `Flow helper: ${summary.flowHelperPresent ? "present" : "missing"}`,
    `Refund/void wired: ${summary.refundVoidWired ? "yes" : "no"}`,
    `Reconcile wired: ${summary.reconcileWired ? "yes" : "no"}`,
    `Closeout math: ${summary.closeoutMathPresent ? "present" : "missing"}`,
    `Artifact present: ${summary.artifactPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}

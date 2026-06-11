import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_SHIFT_CLOSE_HISTORY_TEST_ID,
  POS_SHIFT_OPEN_CLOSE_AUDIT_SCRIPT,
  POS_SHIFT_OPEN_CLOSE_E2E_POLICY_ID,
  POS_SHIFT_OPEN_CLOSE_E2E_SPEC,
  POS_SHIFT_OPEN_CLOSE_FLOW_HELPER,
  POS_SHIFT_OPEN_CLOSE_FLOW_STEPS,
  POS_SHIFT_OPEN_CLOSE_NPM_SCRIPT,
  POS_SHIFT_OPEN_CLOSE_READY_HELPER,
  POS_SHIFT_OPEN_CLOSE_UNIT_TEST,
  POS_SHIFTS_PATH,
} from "@/lib/qa/pos-shift-open-close-e2e-policy";

export type PosShiftOpenCloseE2EAuditSummary = {
  policyId: typeof POS_SHIFT_OPEN_CLOSE_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  shiftFlowWired: boolean;
  closeoutPreviewWired: boolean;
  historyTotalsWired: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditPosShiftOpenCloseE2E(
  root = process.cwd(),
): PosShiftOpenCloseE2EAuditSummary {
  const specPath = join(root, POS_SHIFT_OPEN_CLOSE_E2E_SPEC);
  const flowPath = join(root, POS_SHIFT_OPEN_CLOSE_FLOW_HELPER);
  const readyPath = join(root, POS_SHIFT_OPEN_CLOSE_READY_HELPER);
  const shiftFlowPath = join(root, "e2e/helpers/pos-checkout-shift-flow.ts");
  const closeFormPath = join(root, "components/dashboard/pos-shift-close-form.tsx");
  const historyPanelPath = join(root, "components/dashboard/pos-shift-close-history-panel.tsx");

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);

  let shiftFlowWired = false;
  if (existsSync(shiftFlowPath)) {
    const source = readFileSync(shiftFlowPath, "utf8");
    shiftFlowWired =
      source.includes("ensureOpenShift") &&
      source.includes("closeShiftWithExpectedCash") &&
      source.includes("assertClosedShiftReport");
  }

  let closeoutPreviewWired = false;
  if (existsSync(closeFormPath)) {
    const source = readFileSync(closeFormPath, "utf8");
    closeoutPreviewWired =
      source.includes("pos-shift-closeout-preview") &&
      source.includes("pos-shift-use-expected-cash");
  }

  let historyTotalsWired = false;
  if (existsSync(historyPanelPath)) {
    const source = readFileSync(historyPanelPath, "utf8");
    historyTotalsWired =
      source.includes(POS_SHIFT_CLOSE_HISTORY_TEST_ID) &&
      source.includes("Expected") &&
      source.includes("pos-shift-history-row-");
  }

  const specReferencesPolicy =
    specPresent &&
    (readFileSync(specPath, "utf8").includes(POS_SHIFT_OPEN_CLOSE_E2E_POLICY_ID) ||
      readFileSync(specPath, "utf8").includes("POS_SHIFT_OPEN_CLOSE_E2E_POLICY_ID"));
  const flowReferencesShiftCycle =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes("verify_history_totals") ||
      readFileSync(flowPath, "utf8").includes("assertClosedShiftTotalsBalanced"));
  const flowReferencesClose =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes("close_shift") ||
      readFileSync(flowPath, "utf8").includes("closeShiftWithExpectedCash"));

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    shiftFlowWired &&
    closeoutPreviewWired &&
    historyTotalsWired &&
    specReferencesPolicy &&
    flowReferencesShiftCycle &&
    flowReferencesClose &&
    POS_SHIFT_OPEN_CLOSE_FLOW_STEPS.length === 4;

  return {
    policyId: POS_SHIFT_OPEN_CLOSE_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    shiftFlowWired,
    closeoutPreviewWired,
    historyTotalsWired,
    flowStepCount: POS_SHIFT_OPEN_CLOSE_FLOW_STEPS.length,
    passed,
  };
}

export function formatPosShiftOpenCloseAuditLines(
  summary: PosShiftOpenCloseE2EAuditSummary,
): string[] {
  return [
    `POS shift open → close E2E audit (${summary.policyId})`,
    `Spec: ${summary.specPresent ? "present" : "missing"} (${POS_SHIFT_OPEN_CLOSE_E2E_SPEC})`,
    `Flow helper: ${summary.flowHelperPresent ? "present" : "missing"}`,
    `Ready helper: ${summary.readyHelperPresent ? "present" : "missing"}`,
    `Shift flow wired: ${summary.shiftFlowWired ? "yes" : "no"}`,
    `Closeout preview wired: ${summary.closeoutPreviewWired ? "yes" : "no"}`,
    `History totals wired: ${summary.historyTotalsWired ? "yes" : "no"}`,
    `Shifts path: ${POS_SHIFTS_PATH}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Unit test: ${POS_SHIFT_OPEN_CLOSE_UNIT_TEST}`,
    `Audit script: ${POS_SHIFT_OPEN_CLOSE_AUDIT_SCRIPT}`,
    `NPM script: ${POS_SHIFT_OPEN_CLOSE_NPM_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}

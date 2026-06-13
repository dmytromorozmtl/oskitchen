import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_CHECKOUT_E2E_AUDIT_SCRIPT,
  POS_CHECKOUT_E2E_SPEC,
  POS_CHECKOUT_E2E_FLOW_HELPER,
  POS_CHECKOUT_E2E_FLOW_STEPS,
  POS_CHECKOUT_E2E_NPM_SCRIPT,
  POS_CHECKOUT_E2E_POLICY_ID,
  POS_CHECKOUT_E2E_READY_HELPER,
  POS_CHECKOUT_E2E_UNIT_TEST,
  POS_DISCOUNT_MODE_PERCENT_TEST_ID,
  POS_TERMINAL_PATH,
} from "@/lib/pos/pos-checkout-e2e-policy";

export type PosCheckoutE2EAuditSummary = {
  policyId: typeof POS_CHECKOUT_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  shiftFlowWired: boolean;
  discountWired: boolean;
  refundVoidWired: boolean;
  closeShiftWired: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditPosCheckoutE2E(root = process.cwd()): PosCheckoutE2EAuditSummary {
  const specPath = join(root, POS_CHECKOUT_E2E_SPEC);
  const flowPath = join(root, POS_CHECKOUT_E2E_FLOW_HELPER);
  const readyPath = join(root, POS_CHECKOUT_E2E_READY_HELPER);
  const shiftFlowPath = join(root, "e2e/helpers/pos-checkout-shift-flow.ts");

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);

  let shiftFlowWired = false;
  if (existsSync(shiftFlowPath)) {
    const source = readFileSync(shiftFlowPath, "utf8");
    shiftFlowWired =
      source.includes("ensureOpenShift") &&
      source.includes("closeShiftWithExpectedCash") &&
      source.includes("completePosCashSale");
  }

  let discountWired = false;
  let refundVoidWired = false;
  let closeShiftWired = false;

  if (flowHelperPresent) {
    const source = readFileSync(flowPath, "utf8");
    discountWired =
      source.includes(POS_DISCOUNT_MODE_PERCENT_TEST_ID) ||
      source.includes("applyPosPercentDiscount");
    refundVoidWired =
      source.includes("refundPosTransaction") && source.includes("voidPosTransaction");
    closeShiftWired =
      source.includes("closeShiftWithExpectedCash") &&
      source.includes("assertClosedShiftReport");
  }

  const specReferencesPolicy =
    specPresent &&
    (readFileSync(specPath, "utf8").includes(POS_CHECKOUT_E2E_POLICY_ID) ||
      readFileSync(specPath, "utf8").includes("POS_CHECKOUT_E2E_POLICY_ID"));
  const flowReferencesTerminal =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes(POS_TERMINAL_PATH) ||
      readFileSync(flowPath, "utf8").includes("preparePosTerminal"));

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    shiftFlowWired &&
    discountWired &&
    refundVoidWired &&
    closeShiftWired &&
    specReferencesPolicy &&
    flowReferencesTerminal &&
    POS_CHECKOUT_E2E_FLOW_STEPS.length === 8;

  return {
    policyId: POS_CHECKOUT_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    shiftFlowWired,
    discountWired,
    refundVoidWired,
    closeShiftWired,
    flowStepCount: POS_CHECKOUT_E2E_FLOW_STEPS.length,
    passed,
  };
}

export function formatPosCheckoutE2EAuditLines(summary: PosCheckoutE2EAuditSummary): string[] {
  return [
    `POS checkout E2E audit (${summary.policyId})`,
    `Spec: ${summary.specPresent ? "present" : "missing"} (${POS_CHECKOUT_E2E_SPEC})`,
    `Flow helper: ${summary.flowHelperPresent ? "present" : "missing"}`,
    `Ready helper: ${summary.readyHelperPresent ? "present" : "missing"}`,
    `Shift flow wired: ${summary.shiftFlowWired ? "yes" : "no"}`,
    `Discount wired: ${summary.discountWired ? "yes" : "no"}`,
    `Refund + void wired: ${summary.refundVoidWired ? "yes" : "no"}`,
    `Close shift wired: ${summary.closeShiftWired ? "yes" : "no"}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Unit test: ${POS_CHECKOUT_E2E_UNIT_TEST}`,
    `Audit script: ${POS_CHECKOUT_E2E_AUDIT_SCRIPT}`,
    `NPM script: ${POS_CHECKOUT_E2E_NPM_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}

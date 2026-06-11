import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_CHECKOUT_STATUS_TEST_ID,
  POS_RECEIPT_PANEL_TEST_ID,
  POS_SHIFT_CHECKOUT_RECEIPT_E2E_POLICY_ID,
  POS_SHIFT_CHECKOUT_RECEIPT_E2E_SPEC,
  POS_SHIFT_CHECKOUT_RECEIPT_FLOW_HELPER,
  POS_SHIFT_CHECKOUT_RECEIPT_FLOW_STEPS,
  POS_SHIFT_CHECKOUT_RECEIPT_NPM_SCRIPT,
  POS_SHIFT_CHECKOUT_RECEIPT_READY_HELPER,
  POS_SHIFT_CHECKOUT_RECEIPT_UNIT_TEST,
  POS_TERMINAL_PATH,
} from "@/lib/pos/pos-shift-checkout-receipt-e2e-policy";

export type PosShiftCheckoutReceiptE2EAuditSummary = {
  policyId: typeof POS_SHIFT_CHECKOUT_RECEIPT_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  receiptPanelWired: boolean;
  terminalPagePresent: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditPosShiftCheckoutReceiptE2E(
  root = process.cwd(),
): PosShiftCheckoutReceiptE2EAuditSummary {
  const specPath = join(root, POS_SHIFT_CHECKOUT_RECEIPT_E2E_SPEC);
  const flowPath = join(root, POS_SHIFT_CHECKOUT_RECEIPT_FLOW_HELPER);
  const readyPath = join(root, POS_SHIFT_CHECKOUT_RECEIPT_READY_HELPER);
  const receiptPanelPath = join(root, "components/dashboard/pos-terminal/receipt-panel.tsx");
  const terminalPagePath = join(root, "app/dashboard/pos/terminal/page.tsx");

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);
  const terminalPagePresent = existsSync(terminalPagePath);

  let receiptPanelWired = false;
  if (existsSync(receiptPanelPath)) {
    const receiptSource = readFileSync(receiptPanelPath, "utf8");
    receiptPanelWired =
      receiptSource.includes(POS_RECEIPT_PANEL_TEST_ID) &&
      receiptSource.includes(POS_CHECKOUT_STATUS_TEST_ID);
  }

  const specReferencesPolicy =
    specPresent &&
    (readFileSync(specPath, "utf8").includes(POS_SHIFT_CHECKOUT_RECEIPT_E2E_POLICY_ID) ||
      readFileSync(specPath, "utf8").includes("POS_SHIFT_CHECKOUT_RECEIPT_E2E_POLICY_ID"));
  const flowReferencesTerminal =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes(POS_TERMINAL_PATH) ||
      readFileSync(flowPath, "utf8").includes("POS_TERMINAL_PATH") ||
      readFileSync(flowPath, "utf8").includes("preparePosTerminal"));

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    terminalPagePresent &&
    receiptPanelWired &&
    specReferencesPolicy &&
    flowReferencesTerminal &&
    POS_SHIFT_CHECKOUT_RECEIPT_FLOW_STEPS.length >= 4;

  return {
    policyId: POS_SHIFT_CHECKOUT_RECEIPT_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    receiptPanelWired,
    terminalPagePresent,
    flowStepCount: POS_SHIFT_CHECKOUT_RECEIPT_FLOW_STEPS.length,
    passed,
  };
}

export function formatPosShiftCheckoutReceiptAuditLines(
  summary: PosShiftCheckoutReceiptE2EAuditSummary,
): string[] {
  return [
    `POS shift → checkout → receipt E2E audit (${summary.policyId})`,
    `Spec: ${summary.specPresent ? "present" : "missing"} (${POS_SHIFT_CHECKOUT_RECEIPT_E2E_SPEC})`,
    `Flow helper: ${summary.flowHelperPresent ? "present" : "missing"}`,
    `Ready helper: ${summary.readyHelperPresent ? "present" : "missing"}`,
    `Receipt panel testids wired: ${summary.receiptPanelWired ? "yes" : "no"}`,
    `POS terminal page: ${summary.terminalPagePresent ? "present" : "missing"}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Unit test: ${POS_SHIFT_CHECKOUT_RECEIPT_UNIT_TEST}`,
    `NPM script: ${POS_SHIFT_CHECKOUT_RECEIPT_NPM_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}

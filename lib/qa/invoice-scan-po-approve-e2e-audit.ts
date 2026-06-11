import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  INVOICE_SCANNER_PANEL_TEST_ID,
  INVOICE_SCANNER_PATH,
  INVOICE_SCAN_CONFIRM_BTN_TEST_ID,
  INVOICE_SCAN_GALLERY_INPUT_TEST_ID,
  INVOICE_SCAN_PO_APPROVE_AUDIT_SCRIPT,
  INVOICE_SCAN_PO_APPROVE_E2E_POLICY_ID,
  INVOICE_SCAN_PO_APPROVE_E2E_SPEC,
  INVOICE_SCAN_PO_APPROVE_FLOW_HELPER,
  INVOICE_SCAN_PO_APPROVE_FLOW_STEPS,
  INVOICE_SCAN_PO_APPROVE_NPM_SCRIPT,
  INVOICE_SCAN_PO_APPROVE_READY_HELPER,
  INVOICE_SCAN_PO_APPROVE_UNIT_TEST,
  INVOICE_SCAN_REVIEW_PANEL_TEST_ID,
  PURCHASING_ORDERS_PATH,
} from "@/lib/qa/invoice-scan-po-approve-e2e-policy";

export type InvoiceScanPoApproveE2EAuditSummary = {
  policyId: typeof INVOICE_SCAN_PO_APPROVE_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  scannerUiWired: boolean;
  scannerPagePresent: boolean;
  purchasingPagePresent: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditInvoiceScanPoApproveE2E(
  root = process.cwd(),
): InvoiceScanPoApproveE2EAuditSummary {
  const specPath = join(root, INVOICE_SCAN_PO_APPROVE_E2E_SPEC);
  const flowPath = join(root, INVOICE_SCAN_PO_APPROVE_FLOW_HELPER);
  const readyPath = join(root, INVOICE_SCAN_PO_APPROVE_READY_HELPER);
  const scannerMobilePath = join(root, "components/inventory/invoice-scanner-mobile.tsx");
  const scannerPagePath = join(root, "app/dashboard/inventory/invoice-scanner/page.tsx");
  const purchasingPagePath = join(root, "app/dashboard/purchasing/purchase-orders/page.tsx");

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);
  const scannerPagePresent = existsSync(scannerPagePath);
  const purchasingPagePresent = existsSync(purchasingPagePath);

  let scannerUiWired = false;
  if (existsSync(scannerMobilePath)) {
    const source = readFileSync(scannerMobilePath, "utf8");
    scannerUiWired =
      source.includes(INVOICE_SCANNER_PANEL_TEST_ID) &&
      source.includes(INVOICE_SCAN_GALLERY_INPUT_TEST_ID) &&
      source.includes(INVOICE_SCAN_REVIEW_PANEL_TEST_ID) &&
      source.includes(INVOICE_SCAN_CONFIRM_BTN_TEST_ID);
  }

  const specReferencesPolicy =
    specPresent &&
    (readFileSync(specPath, "utf8").includes(INVOICE_SCAN_PO_APPROVE_E2E_POLICY_ID) ||
      readFileSync(specPath, "utf8").includes("INVOICE_SCAN_PO_APPROVE_E2E_POLICY_ID"));
  const flowReferencesScanner =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes(INVOICE_SCANNER_PATH) ||
      readFileSync(flowPath, "utf8").includes("INVOICE_SCANNER_PATH") ||
      readFileSync(flowPath, "utf8").includes(INVOICE_SCAN_GALLERY_INPUT_TEST_ID));
  const flowReferencesPo =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes(PURCHASING_ORDERS_PATH) ||
      readFileSync(flowPath, "utf8").includes("PURCHASING_ORDERS_PATH") ||
      readFileSync(flowPath, "utf8").includes("verifyPurchaseOrderFromScan"));

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    scannerPagePresent &&
    purchasingPagePresent &&
    scannerUiWired &&
    specReferencesPolicy &&
    flowReferencesScanner &&
    flowReferencesPo &&
    INVOICE_SCAN_PO_APPROVE_FLOW_STEPS.length >= 4;

  return {
    policyId: INVOICE_SCAN_PO_APPROVE_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    scannerUiWired,
    scannerPagePresent,
    purchasingPagePresent,
    flowStepCount: INVOICE_SCAN_PO_APPROVE_FLOW_STEPS.length,
    passed,
  };
}

export function formatInvoiceScanPoApproveAuditLines(
  summary: InvoiceScanPoApproveE2EAuditSummary,
): string[] {
  return [
    `Invoice scan → PO → approve E2E audit (${summary.policyId})`,
    `Spec: ${summary.specPresent ? "present" : "missing"} (${INVOICE_SCAN_PO_APPROVE_E2E_SPEC})`,
    `Flow helper: ${summary.flowHelperPresent ? "present" : "missing"}`,
    `Ready helper: ${summary.readyHelperPresent ? "present" : "missing"}`,
    `Scanner UI testids wired: ${summary.scannerUiWired ? "yes" : "no"}`,
    `Scanner page: ${summary.scannerPagePresent ? "present" : "missing"}`,
    `Purchasing PO page: ${summary.purchasingPagePresent ? "present" : "missing"}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Unit test: ${INVOICE_SCAN_PO_APPROVE_UNIT_TEST}`,
    `Audit script: ${INVOICE_SCAN_PO_APPROVE_AUDIT_SCRIPT}`,
    `NPM script: ${INVOICE_SCAN_PO_APPROVE_NPM_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}

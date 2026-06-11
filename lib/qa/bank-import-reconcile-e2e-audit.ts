import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  BANK_IMPORT_COMMIT_BTN_TEST_ID,
  BANK_IMPORT_CSV_INPUT_TEST_ID,
  BANK_IMPORT_PANEL_TEST_ID,
  BANK_IMPORT_PATH,
  BANK_IMPORT_PREVIEW_BTN_TEST_ID,
  BANK_IMPORT_PREVIEW_PANEL_TEST_ID,
  BANK_IMPORT_RECONCILE_AUDIT_SCRIPT,
  BANK_IMPORT_RECONCILE_E2E_POLICY_ID,
  BANK_IMPORT_RECONCILE_E2E_SPEC,
  BANK_IMPORT_RECONCILE_FLOW_HELPER,
  BANK_IMPORT_RECONCILE_FLOW_STEPS,
  BANK_IMPORT_RECONCILE_NPM_SCRIPT,
  BANK_IMPORT_RECONCILE_READY_HELPER,
  BANK_IMPORT_RECONCILE_UNIT_TEST,
  BANK_RECONCILE_BTN_TEST_ID,
  BANK_RECONCILE_PANEL_TEST_ID,
  BANK_RECONCILE_TX_ROW_TEST_ID,
  BANK_RECONCILIATION_PATH,
} from "@/lib/qa/bank-import-reconcile-e2e-policy";

export type BankImportReconcileE2EAuditSummary = {
  policyId: typeof BANK_IMPORT_RECONCILE_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  bankImportUiWired: boolean;
  bankReconciliationUiWired: boolean;
  bankImportPagePresent: boolean;
  bankReconciliationPagePresent: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditBankImportReconcileE2E(
  root = process.cwd(),
): BankImportReconcileE2EAuditSummary {
  const specPath = join(root, BANK_IMPORT_RECONCILE_E2E_SPEC);
  const flowPath = join(root, BANK_IMPORT_RECONCILE_FLOW_HELPER);
  const readyPath = join(root, BANK_IMPORT_RECONCILE_READY_HELPER);
  const bankImportClientPath = join(root, "components/finance/bank-import-client.tsx");
  const bankImportPagePath = join(root, "app/dashboard/finance/bank-import/page.tsx");
  const bankReconciliationPagePath = join(
    root,
    "app/dashboard/accounting/bank-reconciliation/page.tsx",
  );

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);
  const bankImportPagePresent = existsSync(bankImportPagePath);
  const bankReconciliationPagePresent = existsSync(bankReconciliationPagePath);

  let bankImportUiWired = false;
  if (existsSync(bankImportClientPath)) {
    const source = readFileSync(bankImportClientPath, "utf8");
    bankImportUiWired =
      source.includes(BANK_IMPORT_PANEL_TEST_ID) &&
      source.includes(BANK_IMPORT_CSV_INPUT_TEST_ID) &&
      source.includes(BANK_IMPORT_PREVIEW_PANEL_TEST_ID) &&
      source.includes(BANK_IMPORT_COMMIT_BTN_TEST_ID);
  }

  let bankReconciliationUiWired = false;
  if (existsSync(bankReconciliationPagePath)) {
    const source = readFileSync(bankReconciliationPagePath, "utf8");
    bankReconciliationUiWired =
      source.includes(BANK_RECONCILE_PANEL_TEST_ID) &&
      source.includes(BANK_RECONCILE_TX_ROW_TEST_ID) &&
      source.includes(BANK_RECONCILE_BTN_TEST_ID);
  }

  const specReferencesPolicy =
    specPresent &&
    (readFileSync(specPath, "utf8").includes(BANK_IMPORT_RECONCILE_E2E_POLICY_ID) ||
      readFileSync(specPath, "utf8").includes("BANK_IMPORT_RECONCILE_E2E_POLICY_ID"));
  const flowReferencesImport =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes(BANK_IMPORT_PATH) ||
      readFileSync(flowPath, "utf8").includes("BANK_IMPORT_PATH") ||
      readFileSync(flowPath, "utf8").includes(BANK_IMPORT_PREVIEW_BTN_TEST_ID));
  const flowReferencesReconcile =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes(BANK_RECONCILIATION_PATH) ||
      readFileSync(flowPath, "utf8").includes("BANK_RECONCILIATION_PATH") ||
      readFileSync(flowPath, "utf8").includes("reconcileBankTransaction"));

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    bankImportPagePresent &&
    bankReconciliationPagePresent &&
    bankImportUiWired &&
    bankReconciliationUiWired &&
    specReferencesPolicy &&
    flowReferencesImport &&
    flowReferencesReconcile &&
    BANK_IMPORT_RECONCILE_FLOW_STEPS.length >= 4;

  return {
    policyId: BANK_IMPORT_RECONCILE_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    bankImportUiWired,
    bankReconciliationUiWired,
    bankImportPagePresent,
    bankReconciliationPagePresent,
    flowStepCount: BANK_IMPORT_RECONCILE_FLOW_STEPS.length,
    passed,
  };
}

export function formatBankImportReconcileAuditLines(
  summary: BankImportReconcileE2EAuditSummary,
): string[] {
  return [
    `Bank import → reconcile E2E audit (${summary.policyId})`,
    `Spec: ${summary.specPresent ? "present" : "missing"} (${BANK_IMPORT_RECONCILE_E2E_SPEC})`,
    `Flow helper: ${summary.flowHelperPresent ? "present" : "missing"}`,
    `Ready helper: ${summary.readyHelperPresent ? "present" : "missing"}`,
    `Bank import UI testids wired: ${summary.bankImportUiWired ? "yes" : "no"}`,
    `Bank reconciliation UI testids wired: ${summary.bankReconciliationUiWired ? "yes" : "no"}`,
    `Bank import page: ${summary.bankImportPagePresent ? "present" : "missing"}`,
    `Bank reconciliation page: ${summary.bankReconciliationPagePresent ? "present" : "missing"}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Unit test: ${BANK_IMPORT_RECONCILE_UNIT_TEST}`,
    `Audit script: ${BANK_IMPORT_RECONCILE_AUDIT_SCRIPT}`,
    `NPM script: ${BANK_IMPORT_RECONCILE_NPM_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}

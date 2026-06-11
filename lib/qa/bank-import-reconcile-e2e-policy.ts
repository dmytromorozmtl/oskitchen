/**
 * Blueprint P1-46 — Bank import → reconcile E2E (finance flow).
 *
 * @see e2e/bank-import-reconcile.spec.ts
 * @see components/finance/bank-import-client.tsx
 * @see app/dashboard/accounting/bank-reconciliation/page.tsx
 */

export const BANK_IMPORT_RECONCILE_E2E_POLICY_ID = "bank-import-reconcile-e2e-v1" as const;

export const BANK_IMPORT_PATH = "/dashboard/finance/bank-import" as const;
export const BANK_RECONCILIATION_PATH = "/dashboard/accounting/bank-reconciliation" as const;

export const BANK_IMPORT_PANEL_TEST_ID = "bank-import-panel" as const;
export const BANK_IMPORT_CSV_INPUT_TEST_ID = "bank-import-csv-input" as const;
export const BANK_IMPORT_PREVIEW_BTN_TEST_ID = "bank-import-preview-btn" as const;
export const BANK_IMPORT_PREVIEW_PANEL_TEST_ID = "bank-import-preview" as const;
export const BANK_IMPORT_COMMIT_BTN_TEST_ID = "bank-import-commit-btn" as const;

export const BANK_RECONCILE_PANEL_TEST_ID = "bank-reconciliation-panel" as const;
export const BANK_RECONCILE_TX_ROW_TEST_ID = "bank-reconcile-tx-row" as const;
export const BANK_RECONCILE_BTN_TEST_ID = "bank-reconcile-btn" as const;

export const BANK_IMPORT_COMMIT_SUCCESS_PATTERN =
  /Imported \d+ transactions · \d+ auto-matched/i;
export const BANK_IMPORT_RECONCILED_LABEL = "Reconciled" as const;
export const BANK_IMPORT_UNRECONCILED_LABEL = "Unreconciled" as const;

export const BANK_IMPORT_RECONCILE_VISIBLE_MS = 60_000 as const;

export const BANK_IMPORT_RECONCILE_E2E_SPEC = "e2e/bank-import-reconcile.spec.ts" as const;
export const BANK_IMPORT_RECONCILE_FLOW_HELPER =
  "e2e/helpers/bank-import-reconcile-flow.ts" as const;
export const BANK_IMPORT_RECONCILE_READY_HELPER =
  "e2e/helpers/bank-import-reconcile-ready.ts" as const;
export const BANK_IMPORT_RECONCILE_AUDIT_SCRIPT =
  "scripts/audit-bank-import-reconcile-e2e.ts" as const;
export const BANK_IMPORT_RECONCILE_NPM_SCRIPT = "audit:bank-import-reconcile-e2e" as const;
export const BANK_IMPORT_RECONCILE_UNIT_TEST =
  "tests/unit/bank-import-reconcile-e2e.test.ts" as const;
export const BANK_IMPORT_RECONCILE_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const BANK_IMPORT_RECONCILE_FLOW_STEPS = [
  "csv_preview",
  "import_commit",
  "verify_import_listed",
  "reconcile_tx",
] as const;

export type BankImportReconcileFlowStep = (typeof BANK_IMPORT_RECONCILE_FLOW_STEPS)[number];

export function buildBankImportE2eCsv(description: string, amount = 199.99): string {
  return `date,description,amount,type\n2026-06-09,${description},${amount.toFixed(2)},DEPOSIT`;
}

export function buildBankImportE2eMarker(prefix = "E2E-Bank"): string {
  return `${prefix}-${Date.now()}`;
}

export function hasBankImportReconcileCredentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}

export function isBankImportReconcileE2EEnabled(): boolean {
  return process.env.E2E_BANK_IMPORT_E2E?.trim() === "true";
}

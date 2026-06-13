/**
 * Blueprint P2-33 — AI invoice scanner accuracy regression (50 invoices, 80%+).
 *
 * @see lib/qa/invoice-scanner-accuracy-corpus.ts
 * @see lib/qa/invoice-scanner-accuracy-regression-p2-33-scoring.ts
 * @see tests/unit/invoice-scanner-accuracy-regression-p2-33.test.ts
 */

export const INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_POLICY_ID =
  "invoice-scanner-accuracy-regression-p2-33-v1" as const;

export const INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_INVOICE_COUNT = 50 as const;

export const INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_MIN_PCT = 80 as const;

export const INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_ARTIFACT =
  "artifacts/invoice-scanner-accuracy-regression-p2-33-summary.json" as const;

export const INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_SCRIPT =
  "scripts/run-invoice-scanner-accuracy-regression-p2-33.ts" as const;

export const INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_AUDIT_SCRIPT =
  "scripts/audit-invoice-scanner-accuracy-regression-p2-33.ts" as const;

export const INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_NPM_SCRIPT =
  "audit:invoice-scanner-accuracy-regression-p2-33" as const;

export const INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_UNIT_TEST =
  "tests/unit/invoice-scanner-accuracy-regression-p2-33.test.ts" as const;

export const INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_FLOW_STEPS = [
  "load_corpus_50",
  "score_all_invoices",
  "assert_regression_threshold_80",
] as const;

export type InvoiceScannerAccuracyRegressionP2_33FlowStep =
  (typeof INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_FLOW_STEPS)[number];

export function isInvoiceScannerAccuracyRegressionP2_33Pass(accuracyPct: number): boolean {
  return accuracyPct >= INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_MIN_PCT;
}

export function isInvoiceScannerAccuracyRegressionP2_33Fail(accuracyPct: number): boolean {
  return accuracyPct < INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_MIN_PCT;
}

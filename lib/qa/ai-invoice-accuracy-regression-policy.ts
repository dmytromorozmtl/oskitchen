/**
 * Blueprint P1-55 — AI invoice accuracy regression (50+ invoices, <95% = fail).
 *
 * @see lib/qa/invoice-scanner-accuracy-corpus.ts
 * @see lib/qa/ai-invoice-accuracy-regression-scoring.ts
 * @see tests/unit/ai-invoice-accuracy-regression.test.ts
 */

export {
  INVOICE_SCANNER_ACCURACY_MIN_INVOICES,
} from "@/lib/qa/invoice-scanner-accuracy-benchmark-policy";

export const AI_INVOICE_ACCURACY_REGRESSION_POLICY_ID =
  "ai-invoice-accuracy-regression-v1" as const;

/** Stricter CI gate than P0-18 benchmark (85%) — regression fails below 95%. */
export const AI_INVOICE_ACCURACY_REGRESSION_MIN_PCT = 95 as const;

export const AI_INVOICE_ACCURACY_REGRESSION_ARTIFACT =
  "artifacts/ai-invoice-accuracy-regression-summary.json" as const;

export const AI_INVOICE_ACCURACY_REGRESSION_SCRIPT =
  "scripts/run-ai-invoice-accuracy-regression.ts" as const;

export const AI_INVOICE_ACCURACY_REGRESSION_AUDIT_SCRIPT =
  "scripts/audit-ai-invoice-accuracy-regression.ts" as const;

export const AI_INVOICE_ACCURACY_REGRESSION_NPM_SCRIPT =
  "audit:ai-invoice-accuracy-regression" as const;

export const AI_INVOICE_ACCURACY_REGRESSION_UNIT_TEST =
  "tests/unit/ai-invoice-accuracy-regression.test.ts" as const;

export const AI_INVOICE_ACCURACY_REGRESSION_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const AI_INVOICE_ACCURACY_REGRESSION_FLOW_STEPS = [
  "load_corpus_52",
  "score_all_invoices",
  "assert_regression_threshold_95",
] as const;

export type AiInvoiceAccuracyRegressionFlowStep =
  (typeof AI_INVOICE_ACCURACY_REGRESSION_FLOW_STEPS)[number];

export function isAiInvoiceAccuracyRegressionPass(accuracyPct: number): boolean {
  return accuracyPct >= AI_INVOICE_ACCURACY_REGRESSION_MIN_PCT;
}

export function isAiInvoiceAccuracyRegressionFail(accuracyPct: number): boolean {
  return accuracyPct < AI_INVOICE_ACCURACY_REGRESSION_MIN_PCT;
}

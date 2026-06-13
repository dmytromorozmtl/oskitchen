import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_AUDIT_SCRIPT,
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_FLOW_STEPS,
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_INVOICE_COUNT,
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_MIN_PCT,
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_NPM_SCRIPT,
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_POLICY_ID,
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_SCRIPT,
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_UNIT_TEST,
} from "@/lib/qa/invoice-scanner-accuracy-regression-p2-33-policy";
import {
  buildInvoiceScannerAccuracyCorpusP2_33,
  runInvoiceScannerAccuracyRegressionP2_33,
} from "@/lib/qa/invoice-scanner-accuracy-regression-p2-33-scoring";

export type InvoiceScannerAccuracyRegressionP2_33AuditSummary = {
  policyId: typeof INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_POLICY_ID;
  regressionScriptPresent: boolean;
  scoringWired: boolean;
  corpusCount: number;
  invoiceCount: number;
  thresholdPct: number;
  goldenPassed: boolean;
  supplierAccuracyPct: number;
  amountAccuracyPct: number;
  lineItemAccuracyPct: number;
  overallAccuracyPct: number;
  flowStepCount: number;
  passed: boolean;
};

export function auditInvoiceScannerAccuracyRegressionP2_33(
  root = process.cwd(),
): InvoiceScannerAccuracyRegressionP2_33AuditSummary {
  const regressionScriptPath = join(root, INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_SCRIPT);
  const scoringPath = join(
    root,
    "lib/qa/invoice-scanner-accuracy-regression-p2-33-scoring.ts",
  );
  const unitTestPath = join(root, INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_UNIT_TEST);

  const regressionScriptPresent = existsSync(regressionScriptPath);

  let scoringWired = false;
  if (existsSync(scoringPath)) {
    const source = readFileSync(scoringPath, "utf8");
    scoringWired =
      source.includes("runInvoiceScannerAccuracyRegressionP2_33") &&
      source.includes("INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_MIN_PCT");
  }

  const unitTestReferencesPolicy =
    existsSync(unitTestPath) &&
    readFileSync(unitTestPath, "utf8").includes(
      INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_POLICY_ID,
    );

  const fixtures = buildInvoiceScannerAccuracyCorpusP2_33();
  const result = runInvoiceScannerAccuracyRegressionP2_33(fixtures);

  const passed =
    regressionScriptPresent &&
    scoringWired &&
    unitTestReferencesPolicy &&
    fixtures.length === INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_INVOICE_COUNT &&
    result.passed &&
    result.overallAccuracyPct >= INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_MIN_PCT &&
    INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_FLOW_STEPS.length === 3;

  return {
    policyId: INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_POLICY_ID,
    regressionScriptPresent,
    scoringWired,
    corpusCount: fixtures.length,
    invoiceCount: INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_INVOICE_COUNT,
    thresholdPct: INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_MIN_PCT,
    goldenPassed: result.passed,
    supplierAccuracyPct: result.supplierAccuracyPct,
    amountAccuracyPct: result.amountAccuracyPct,
    lineItemAccuracyPct: result.lineItemAccuracyPct,
    overallAccuracyPct: result.overallAccuracyPct,
    flowStepCount: INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_FLOW_STEPS.length,
    passed,
  };
}

export function formatInvoiceScannerAccuracyRegressionP2_33AuditLines(
  summary: InvoiceScannerAccuracyRegressionP2_33AuditSummary,
): string[] {
  return [
    `Invoice scanner accuracy regression audit (${summary.policyId})`,
    `Regression script: ${summary.regressionScriptPresent ? "present" : "missing"} (${INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_SCRIPT})`,
    `Scoring wired: ${summary.scoringWired ? "yes" : "no"}`,
    `Corpus: ${summary.corpusCount} invoices (exactly ${summary.invoiceCount})`,
    `Threshold: ${summary.thresholdPct}% (accuracy <${summary.thresholdPct}% = fail)`,
    `Supplier accuracy: ${summary.supplierAccuracyPct}%`,
    `Amount accuracy: ${summary.amountAccuracyPct}%`,
    `Line-item accuracy: ${summary.lineItemAccuracyPct}%`,
    `Overall accuracy: ${summary.overallAccuracyPct}%`,
    `Golden corpus: ${summary.goldenPassed ? "PASS" : "FAIL"}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Unit test: ${INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_UNIT_TEST}`,
    `Audit script: ${INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_AUDIT_SCRIPT}`,
    `NPM script: ${INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_NPM_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}

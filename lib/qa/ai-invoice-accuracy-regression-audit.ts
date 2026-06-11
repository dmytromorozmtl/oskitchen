import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  AI_INVOICE_ACCURACY_REGRESSION_AUDIT_SCRIPT,
  AI_INVOICE_ACCURACY_REGRESSION_FLOW_STEPS,
  AI_INVOICE_ACCURACY_REGRESSION_MIN_PCT,
  AI_INVOICE_ACCURACY_REGRESSION_NPM_SCRIPT,
  AI_INVOICE_ACCURACY_REGRESSION_POLICY_ID,
  AI_INVOICE_ACCURACY_REGRESSION_SCRIPT,
  AI_INVOICE_ACCURACY_REGRESSION_UNIT_TEST,
  INVOICE_SCANNER_ACCURACY_MIN_INVOICES,
} from "@/lib/qa/ai-invoice-accuracy-regression-policy";
import { buildInvoiceScannerAccuracyCorpus } from "@/lib/qa/invoice-scanner-accuracy-corpus";
import { runAiInvoiceAccuracyRegression } from "@/lib/qa/ai-invoice-accuracy-regression-scoring";

export type AiInvoiceAccuracyRegressionAuditSummary = {
  policyId: typeof AI_INVOICE_ACCURACY_REGRESSION_POLICY_ID;
  regressionScriptPresent: boolean;
  scoringWired: boolean;
  corpusCount: number;
  minInvoices: number;
  thresholdPct: number;
  goldenPassed: boolean;
  supplierAccuracyPct: number;
  amountAccuracyPct: number;
  lineItemAccuracyPct: number;
  overallAccuracyPct: number;
  flowStepCount: number;
  passed: boolean;
};

export function auditAiInvoiceAccuracyRegression(
  root = process.cwd(),
): AiInvoiceAccuracyRegressionAuditSummary {
  const regressionScriptPath = join(root, AI_INVOICE_ACCURACY_REGRESSION_SCRIPT);
  const scoringPath = join(root, "lib/qa/ai-invoice-accuracy-regression-scoring.ts");
  const unitTestPath = join(root, AI_INVOICE_ACCURACY_REGRESSION_UNIT_TEST);

  const regressionScriptPresent = existsSync(regressionScriptPath);

  let scoringWired = false;
  if (existsSync(scoringPath)) {
    const source = readFileSync(scoringPath, "utf8");
    scoringWired =
      source.includes("runAiInvoiceAccuracyRegression") &&
      source.includes("AI_INVOICE_ACCURACY_REGRESSION_MIN_PCT");
  }

  const unitTestReferencesPolicy =
    existsSync(unitTestPath) &&
    (readFileSync(unitTestPath, "utf8").includes(AI_INVOICE_ACCURACY_REGRESSION_POLICY_ID) ||
      readFileSync(unitTestPath, "utf8").includes("AI_INVOICE_ACCURACY_REGRESSION_POLICY_ID"));

  const fixtures = buildInvoiceScannerAccuracyCorpus();
  const result = runAiInvoiceAccuracyRegression(fixtures);

  const passed =
    regressionScriptPresent &&
    scoringWired &&
    unitTestReferencesPolicy &&
    fixtures.length >= INVOICE_SCANNER_ACCURACY_MIN_INVOICES &&
    result.passed &&
    result.overallAccuracyPct >= AI_INVOICE_ACCURACY_REGRESSION_MIN_PCT &&
    AI_INVOICE_ACCURACY_REGRESSION_FLOW_STEPS.length === 3;

  return {
    policyId: AI_INVOICE_ACCURACY_REGRESSION_POLICY_ID,
    regressionScriptPresent,
    scoringWired,
    corpusCount: fixtures.length,
    minInvoices: INVOICE_SCANNER_ACCURACY_MIN_INVOICES,
    thresholdPct: AI_INVOICE_ACCURACY_REGRESSION_MIN_PCT,
    goldenPassed: result.passed,
    supplierAccuracyPct: result.supplierAccuracyPct,
    amountAccuracyPct: result.amountAccuracyPct,
    lineItemAccuracyPct: result.lineItemAccuracyPct,
    overallAccuracyPct: result.overallAccuracyPct,
    flowStepCount: AI_INVOICE_ACCURACY_REGRESSION_FLOW_STEPS.length,
    passed,
  };
}

export function formatAiInvoiceAccuracyRegressionAuditLines(
  summary: AiInvoiceAccuracyRegressionAuditSummary,
): string[] {
  return [
    `AI invoice accuracy regression audit (${summary.policyId})`,
    `Regression script: ${summary.regressionScriptPresent ? "present" : "missing"} (${AI_INVOICE_ACCURACY_REGRESSION_SCRIPT})`,
    `Scoring wired: ${summary.scoringWired ? "yes" : "no"}`,
    `Corpus: ${summary.corpusCount} invoices (min ${summary.minInvoices})`,
    `Threshold: ${summary.thresholdPct}% (accuracy <${summary.thresholdPct}% = fail)`,
    `Supplier accuracy: ${summary.supplierAccuracyPct}%`,
    `Amount accuracy: ${summary.amountAccuracyPct}%`,
    `Line-item accuracy: ${summary.lineItemAccuracyPct}%`,
    `Overall accuracy: ${summary.overallAccuracyPct}%`,
    `Golden corpus: ${summary.goldenPassed ? "PASS" : "FAIL"}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Unit test: ${AI_INVOICE_ACCURACY_REGRESSION_UNIT_TEST}`,
    `Audit script: ${AI_INVOICE_ACCURACY_REGRESSION_AUDIT_SCRIPT}`,
    `NPM script: ${AI_INVOICE_ACCURACY_REGRESSION_NPM_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}

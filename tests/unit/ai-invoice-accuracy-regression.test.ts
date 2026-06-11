import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditAiInvoiceAccuracyRegression } from "@/lib/qa/ai-invoice-accuracy-regression-audit";
import {
  AI_INVOICE_ACCURACY_REGRESSION_ARTIFACT,
  AI_INVOICE_ACCURACY_REGRESSION_AUDIT_SCRIPT,
  AI_INVOICE_ACCURACY_REGRESSION_CI_WORKFLOW,
  AI_INVOICE_ACCURACY_REGRESSION_FLOW_STEPS,
  AI_INVOICE_ACCURACY_REGRESSION_MIN_PCT,
  AI_INVOICE_ACCURACY_REGRESSION_NPM_SCRIPT,
  AI_INVOICE_ACCURACY_REGRESSION_POLICY_ID,
  AI_INVOICE_ACCURACY_REGRESSION_SCRIPT,
  AI_INVOICE_ACCURACY_REGRESSION_UNIT_TEST,
  INVOICE_SCANNER_ACCURACY_MIN_INVOICES,
  isAiInvoiceAccuracyRegressionFail,
  isAiInvoiceAccuracyRegressionPass,
} from "@/lib/qa/ai-invoice-accuracy-regression-policy";
import {
  buildDegradedInvoiceRegressionFixtures,
  runAiInvoiceAccuracyRegression,
} from "@/lib/qa/ai-invoice-accuracy-regression-scoring";
import { buildInvoiceScannerAccuracyCorpus } from "@/lib/qa/invoice-scanner-accuracy-corpus";

const ROOT = process.cwd();

describe("AI invoice accuracy regression (P1-55)", () => {
  it("locks policy id, 50+ invoices, and 95% regression gate", () => {
    expect(AI_INVOICE_ACCURACY_REGRESSION_POLICY_ID).toBe(
      "ai-invoice-accuracy-regression-v1",
    );
    expect(INVOICE_SCANNER_ACCURACY_MIN_INVOICES).toBeGreaterThanOrEqual(50);
    expect(AI_INVOICE_ACCURACY_REGRESSION_MIN_PCT).toBe(95);
    expect(AI_INVOICE_ACCURACY_REGRESSION_FLOW_STEPS).toEqual([
      "load_corpus_52",
      "score_all_invoices",
      "assert_regression_threshold_95",
    ]);
  });

  it("passes golden corpus with 52 invoices at 100% (above 95% gate)", () => {
    const fixtures = buildInvoiceScannerAccuracyCorpus();
    expect(fixtures.length).toBeGreaterThanOrEqual(INVOICE_SCANNER_ACCURACY_MIN_INVOICES);

    const result = runAiInvoiceAccuracyRegression(fixtures);
    expect(result.supplierAccuracyPct).toBeGreaterThanOrEqual(
      AI_INVOICE_ACCURACY_REGRESSION_MIN_PCT,
    );
    expect(result.amountAccuracyPct).toBeGreaterThanOrEqual(
      AI_INVOICE_ACCURACY_REGRESSION_MIN_PCT,
    );
    expect(result.lineItemAccuracyPct).toBeGreaterThanOrEqual(
      AI_INVOICE_ACCURACY_REGRESSION_MIN_PCT,
    );
    expect(result.overallAccuracyPct).toBeGreaterThanOrEqual(
      AI_INVOICE_ACCURACY_REGRESSION_MIN_PCT,
    );
    expect(result.passed).toBe(true);
  });

  it("fails regression when accuracy drops below 95%", () => {
    const fixtures = buildInvoiceScannerAccuracyCorpus();
    const degraded = buildDegradedInvoiceRegressionFixtures(fixtures, 3);
    const result = runAiInvoiceAccuracyRegression(degraded);

    expect(result.supplierAccuracyPct).toBeLessThan(AI_INVOICE_ACCURACY_REGRESSION_MIN_PCT);
    expect(result.passed).toBe(false);
    expect(isAiInvoiceAccuracyRegressionFail(result.supplierAccuracyPct)).toBe(true);
    expect(isAiInvoiceAccuracyRegressionPass(100)).toBe(true);
  });

  it("audits regression script, scoring, and golden corpus", () => {
    const summary = auditAiInvoiceAccuracyRegression(ROOT);
    expect(summary.regressionScriptPresent).toBe(true);
    expect(summary.scoringWired).toBe(true);
    expect(summary.corpusCount).toBeGreaterThanOrEqual(INVOICE_SCANNER_ACCURACY_MIN_INVOICES);
    expect(summary.thresholdPct).toBe(95);
    expect(summary.goldenPassed).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm scripts, and deploy gate", () => {
    expect(existsSync(join(ROOT, AI_INVOICE_ACCURACY_REGRESSION_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, AI_INVOICE_ACCURACY_REGRESSION_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, AI_INVOICE_ACCURACY_REGRESSION_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[AI_INVOICE_ACCURACY_REGRESSION_NPM_SCRIPT]).toContain(
      "audit-ai-invoice-accuracy-regression.ts",
    );
    expect(pkg.scripts?.["test:ci:ai-invoice-accuracy-regression"]).toContain(
      AI_INVOICE_ACCURACY_REGRESSION_UNIT_TEST,
    );
    expect(pkg.scripts?.["regression:ai-invoice-accuracy"]).toContain(
      "run-ai-invoice-accuracy-regression.ts",
    );

    const workflow = readFileSync(join(ROOT, AI_INVOICE_ACCURACY_REGRESSION_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:ai-invoice-accuracy-regression");

    expect(AI_INVOICE_ACCURACY_REGRESSION_ARTIFACT).toBe(
      "artifacts/ai-invoice-accuracy-regression-summary.json",
    );
  });
});

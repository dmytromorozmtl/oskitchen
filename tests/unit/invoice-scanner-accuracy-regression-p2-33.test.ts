import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditInvoiceScannerAccuracyRegressionP2_33 } from "@/lib/qa/invoice-scanner-accuracy-regression-p2-33-audit";
import {
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_ARTIFACT,
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_AUDIT_SCRIPT,
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_CI_WORKFLOW,
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_FLOW_STEPS,
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_INVOICE_COUNT,
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_MIN_PCT,
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_NPM_SCRIPT,
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_POLICY_ID,
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_SCRIPT,
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_UNIT_TEST,
  isInvoiceScannerAccuracyRegressionP2_33Fail,
  isInvoiceScannerAccuracyRegressionP2_33Pass,
} from "@/lib/qa/invoice-scanner-accuracy-regression-p2-33-policy";
import {
  buildDegradedInvoiceRegressionP2_33Fixtures,
  buildInvoiceScannerAccuracyCorpusP2_33,
  runInvoiceScannerAccuracyRegressionP2_33,
} from "@/lib/qa/invoice-scanner-accuracy-regression-p2-33-scoring";

const ROOT = process.cwd();

describe("Invoice scanner accuracy regression (P2-33)", () => {
  it("locks policy id, 50 invoices, and 80% regression gate", () => {
    expect(INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_POLICY_ID).toBe(
      "invoice-scanner-accuracy-regression-p2-33-v1",
    );
    expect(INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_INVOICE_COUNT).toBe(50);
    expect(INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_MIN_PCT).toBe(80);
    expect(INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_FLOW_STEPS).toEqual([
      "load_corpus_50",
      "score_all_invoices",
      "assert_regression_threshold_80",
    ]);
  });

  it("passes golden corpus with exactly 50 invoices at 100% (above 80% gate)", () => {
    const fixtures = buildInvoiceScannerAccuracyCorpusP2_33();
    expect(fixtures.length).toBe(INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_INVOICE_COUNT);

    const result = runInvoiceScannerAccuracyRegressionP2_33(fixtures);
    expect(result.supplierAccuracyPct).toBeGreaterThanOrEqual(
      INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_MIN_PCT,
    );
    expect(result.amountAccuracyPct).toBeGreaterThanOrEqual(
      INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_MIN_PCT,
    );
    expect(result.lineItemAccuracyPct).toBeGreaterThanOrEqual(
      INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_MIN_PCT,
    );
    expect(result.overallAccuracyPct).toBeGreaterThanOrEqual(
      INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_MIN_PCT,
    );
    expect(result.passed).toBe(true);
  });

  it("fails regression when accuracy drops below 80%", () => {
    const fixtures = buildInvoiceScannerAccuracyCorpusP2_33();
    const degraded = buildDegradedInvoiceRegressionP2_33Fixtures(fixtures, 11);
    const result = runInvoiceScannerAccuracyRegressionP2_33(degraded);

    expect(result.supplierAccuracyPct).toBeLessThan(
      INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_MIN_PCT,
    );
    expect(result.passed).toBe(false);
    expect(isInvoiceScannerAccuracyRegressionP2_33Fail(result.supplierAccuracyPct)).toBe(true);
    expect(isInvoiceScannerAccuracyRegressionP2_33Pass(100)).toBe(true);
  });

  it("audits regression script, scoring, and golden corpus", () => {
    const summary = auditInvoiceScannerAccuracyRegressionP2_33(ROOT);
    expect(summary.regressionScriptPresent).toBe(true);
    expect(summary.scoringWired).toBe(true);
    expect(summary.corpusCount).toBe(INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_INVOICE_COUNT);
    expect(summary.thresholdPct).toBe(80);
    expect(summary.goldenPassed).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm scripts, and deploy gate", () => {
    expect(existsSync(join(ROOT, INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_AUDIT_SCRIPT))).toBe(
      true,
    );
    expect(existsSync(join(ROOT, INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_NPM_SCRIPT]).toContain(
      "audit-invoice-scanner-accuracy-regression-p2-33.ts",
    );
    expect(pkg.scripts?.["check:invoice-scanner-accuracy-regression-p2-33"]).toContain(
      INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_UNIT_TEST,
    );
    expect(pkg.scripts?.["regression:invoice-scanner-accuracy-p2-33"]).toContain(
      "run-invoice-scanner-accuracy-regression-p2-33.ts",
    );

    const archive = JSON.parse(
      readFileSync(join(ROOT, "config/npm-scripts/archive-v1.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(archive.scripts?.["test:ci:invoice-scanner-accuracy-regression-p2-33"]).toContain(
      INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_UNIT_TEST,
    );

    const workflow = readFileSync(
      join(ROOT, INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_CI_WORKFLOW),
      "utf8",
    );
    expect(workflow).toContain("invoice-scanner-accuracy-regression-p2-33");

    expect(INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_ARTIFACT).toBe(
      "artifacts/invoice-scanner-accuracy-regression-p2-33-summary.json",
    );
  });
});

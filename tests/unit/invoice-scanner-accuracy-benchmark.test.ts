import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  INVOICE_SCANNER_ACCURACY_BENCHMARK_ARTIFACT,
  INVOICE_SCANNER_ACCURACY_BENCHMARK_NPM_SCRIPT,
  INVOICE_SCANNER_ACCURACY_BENCHMARK_POLICY_ID,
  INVOICE_SCANNER_ACCURACY_BENCHMARK_SCRIPT,
  INVOICE_SCANNER_ACCURACY_BENCHMARK_UNIT_TEST,
  INVOICE_SCANNER_ACCURACY_MIN_INVOICES,
  INVOICE_SCANNER_ACCURACY_MIN_OVERALL_PCT,
} from "@/lib/qa/invoice-scanner-accuracy-benchmark-policy";
import { buildInvoiceScannerAccuracyCorpus } from "@/lib/qa/invoice-scanner-accuracy-corpus";
import {
  runInvoiceScannerAccuracyBenchmark,
  scoreScannedInvoice,
} from "@/lib/qa/invoice-scanner-accuracy-scoring";
import { mapOcrResultToScannedInvoice } from "@/lib/qa/invoice-scanner-ocr-mapper";

const ROOT = process.cwd();

describe("invoice scanner accuracy benchmark (P0-18)", () => {
  it("locks policy id and script paths", () => {
    expect(INVOICE_SCANNER_ACCURACY_BENCHMARK_POLICY_ID).toBe(
      "invoice-scanner-accuracy-benchmark-v1",
    );
    expect(existsSync(join(ROOT, INVOICE_SCANNER_ACCURACY_BENCHMARK_SCRIPT))).toBe(true);
    expect(INVOICE_SCANNER_ACCURACY_BENCHMARK_UNIT_TEST).toBe(
      "tests/unit/invoice-scanner-accuracy-benchmark.test.ts",
    );
  });

  it("scores supplier, amount, and line items per invoice", () => {
    const [fixture] = buildInvoiceScannerAccuracyCorpus();
    const expected = mapOcrResultToScannedInvoice(fixture!.groundTruth);
    const predicted = mapOcrResultToScannedInvoice(fixture!.predicted);
    const score = scoreScannedInvoice(predicted, expected);
    expect(score.supplierMatch).toBe(true);
    expect(score.amountMatch).toBe(true);
    expect(score.lineItemCountMatch).toBe(true);
    expect(score.overallPct).toBeGreaterThanOrEqual(INVOICE_SCANNER_ACCURACY_MIN_OVERALL_PCT);
  });

  it("passes golden corpus with 50+ invoices above 85% accuracy", () => {
    const fixtures = buildInvoiceScannerAccuracyCorpus();
    expect(fixtures.length).toBeGreaterThanOrEqual(INVOICE_SCANNER_ACCURACY_MIN_INVOICES);

    const result = runInvoiceScannerAccuracyBenchmark(fixtures);
    expect(result.supplierAccuracyPct).toBeGreaterThanOrEqual(
      INVOICE_SCANNER_ACCURACY_MIN_OVERALL_PCT,
    );
    expect(result.amountAccuracyPct).toBeGreaterThanOrEqual(
      INVOICE_SCANNER_ACCURACY_MIN_OVERALL_PCT,
    );
    expect(result.lineItemAccuracyPct).toBeGreaterThanOrEqual(
      INVOICE_SCANNER_ACCURACY_MIN_OVERALL_PCT,
    );
    expect(result.overallAccuracyPct).toBeGreaterThanOrEqual(
      INVOICE_SCANNER_ACCURACY_MIN_OVERALL_PCT,
    );
    expect(result.passed).toBe(true);
  });

  it("registers npm benchmark script and artifact path", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[INVOICE_SCANNER_ACCURACY_BENCHMARK_NPM_SCRIPT]).toContain(
      "invoice-scanner-accuracy-benchmark.test.ts",
    );
    expect(pkg.scripts?.["benchmark:invoice-scanner-accuracy"]).toContain(
      "run-invoice-scanner-accuracy-benchmark.ts",
    );
    expect(INVOICE_SCANNER_ACCURACY_BENCHMARK_ARTIFACT).toBe(
      "artifacts/invoice-scanner-accuracy-benchmark-summary.json",
    );
  });
});

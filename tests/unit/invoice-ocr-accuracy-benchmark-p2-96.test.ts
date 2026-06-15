import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditInvoiceOcrAccuracyBenchmarkP2_96,
  formatInvoiceOcrAccuracyBenchmarkP2_96AuditLines,
} from "@/lib/ai/invoice-ocr-accuracy-benchmark-p2-96-audit";
import { INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_METRICS } from "@/lib/ai/invoice-ocr-accuracy-benchmark-p2-96-content";
import {
  buildSupplierAccuracyBreakdown,
  computeMeanConfidencePct,
  computePriceVarianceAccuracyPct,
  runInvoiceOcrAccuracyBenchmarkP2_96,
} from "@/lib/ai/invoice-ocr-accuracy-benchmark-p2-96-operations";
import {
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_ARTIFACT,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_CI_WORKFLOW,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_DOC,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_METRIC_COUNT,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_MIN_ACCURACY_PCT,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_MIN_INVOICES,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_NPM_SCRIPT,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_POLICY_ID,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_UNIT_TEST,
} from "@/lib/ai/invoice-ocr-accuracy-benchmark-p2-96-policy";
import {
  buildInvoiceOcrAccuracyCorpusP2_96,
  INVOICE_OCR_ACCURACY_CORPUS_P2_96_COUNT,
} from "@/lib/qa/invoice-scanner-accuracy-corpus";
import { mapOcrResultToScannedInvoice } from "@/lib/qa/invoice-scanner-ocr-mapper";
import { loadInvoiceOcrAccuracyBenchmarkP2_96 } from "@/services/ai/invoice-ocr-accuracy-benchmark-p2-96-service";

const ROOT = process.cwd();

describe("Invoice OCR accuracy benchmark (P2-96)", () => {
  it("locks policy id, 100 invoices, and four metrics", () => {
    expect(INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_POLICY_ID).toBe(
      "invoice-ocr-accuracy-benchmark-p2-96-v1",
    );
    expect(INVOICE_OCR_ACCURACY_CORPUS_P2_96_COUNT).toBe(100);
    expect(INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_MIN_INVOICES).toBe(100);
    expect(INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_METRIC_COUNT).toBe(4);
    expect(INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_METRICS).toHaveLength(4);
  });

  it("passes full invoice OCR accuracy benchmark audit", () => {
    const summary = auditInvoiceOcrAccuracyBenchmarkP2_96(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.runScriptWired).toBe(true);
    expect(summary.legacyPolicyLinked).toBe(true);
    expect(summary.corpusCountCorrect).toBe(true);
    expect(summary.metricCountCorrect).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("computes price variance and confidence for golden fixtures", () => {
    const [fixture] = buildInvoiceOcrAccuracyCorpusP2_96();
    const expected = mapOcrResultToScannedInvoice(fixture!.groundTruth);
    const predicted = mapOcrResultToScannedInvoice(fixture!.predicted);
    expect(computePriceVarianceAccuracyPct(predicted, expected)).toBe(100);
    expect(computeMeanConfidencePct(predicted)).toBeGreaterThanOrEqual(70);
  });

  it("passes 100-invoice benchmark with supplier breakdown", () => {
    const fixtures = buildInvoiceOcrAccuracyCorpusP2_96();
    expect(fixtures.length).toBe(100);

    const result = runInvoiceOcrAccuracyBenchmarkP2_96(fixtures);
    expect(result.supplierAccuracyPct).toBeGreaterThanOrEqual(
      INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_MIN_ACCURACY_PCT,
    );
    expect(result.lineItemAccuracyPct).toBeGreaterThanOrEqual(
      INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_MIN_ACCURACY_PCT,
    );
    expect(result.priceVarianceAccuracyPct).toBeGreaterThanOrEqual(
      INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_MIN_ACCURACY_PCT,
    );
    expect(result.avgConfidencePct).toBeGreaterThanOrEqual(70);
    expect(result.supplierBreakdown.length).toBeGreaterThanOrEqual(8);
    expect(result.passed).toBe(true);

    const breakdown = buildSupplierAccuracyBreakdown(fixtures);
    expect(breakdown.every((row) => row.supplierAccuracyPct >= 85)).toBe(true);
  });

  it("loads benchmark snapshot via service", () => {
    const snapshot = loadInvoiceOcrAccuracyBenchmarkP2_96();
    expect(snapshot.policyId).toBe(INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_POLICY_ID);
    expect(snapshot.invoiceCount).toBe(100);
    expect(snapshot.mode).toBe("golden-corpus-regression");
    expect(snapshot.passed).toBe(true);
  });

  it("wires CI audit script, benchmark script, and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_NPM_SCRIPT]).toContain(
      "audit-invoice-ocr-accuracy-benchmark-p2-96.ts",
    );
    expect(pkg.scripts["test:ci:invoice-ocr-accuracy-benchmark-p2-96"]).toContain(
      INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_UNIT_TEST,
    );
    expect(pkg.scripts["benchmark:invoice-ocr-accuracy-p2-96"]).toContain(
      "run-invoice-ocr-accuracy-benchmark-p2-96.ts",
    );

    const workflow = readFileSync(join(ROOT, INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_NPM_SCRIPT);

    expect(existsSync(join(ROOT, INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_DOC))).toBe(true);
    expect(INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_ARTIFACT).toBe(
      "artifacts/invoice-ocr-accuracy-benchmark-p2-96-summary.json",
    );
    expect(formatInvoiceOcrAccuracyBenchmarkP2_96AuditLines(
      auditInvoiceOcrAccuracyBenchmarkP2_96(ROOT),
    ).length).toBeGreaterThan(5);
  });
});

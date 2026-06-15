/**
 * Extended scoring for invoice OCR accuracy benchmark (Blueprint P2-96).
 */

import type { ScannedInvoice } from "@/lib/inventory/invoice-scanner-types";
import {
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_MIN_ACCURACY_PCT,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_MIN_INVOICES,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_POLICY_ID,
} from "@/lib/ai/invoice-ocr-accuracy-benchmark-p2-96-policy";
import type { InvoiceScannerAccuracyFixture } from "@/lib/qa/invoice-scanner-accuracy-corpus";
import { mapOcrResultToScannedInvoice } from "@/lib/qa/invoice-scanner-ocr-mapper";
import {
  runInvoiceScannerAccuracyBenchmark,
  scoreScannedInvoice,
  type InvoiceScannerAccuracyBenchmarkResult,
} from "@/lib/qa/invoice-scanner-accuracy-scoring";

export type SupplierAccuracyRow = {
  supplier: string;
  invoiceCount: number;
  supplierAccuracyPct: number;
  amountAccuracyPct: number;
  lineItemAccuracyPct: number;
};

export type InvoiceOcrAccuracyBenchmarkP2_96Result = InvoiceScannerAccuracyBenchmarkResult & {
  policyId: typeof INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_POLICY_ID;
  priceVarianceAccuracyPct: number;
  avgConfidencePct: number;
  supplierBreakdown: SupplierAccuracyRow[];
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function computePriceVarianceAccuracyPct(
  predicted: ScannedInvoice,
  expected: ScannedInvoice,
): number {
  if (expected.lineItems.length === 0) return 100;

  let totalRelativeError = 0;
  let matched = 0;

  for (const predLine of predicted.lineItems) {
    const predName = normalizeText(predLine.name);
    const expLine = expected.lineItems.find((line) => {
      const expName = normalizeText(line.name);
      return expName === predName || expName.includes(predName) || predName.includes(expName);
    });
    if (!expLine || expLine.unitPrice <= 0) continue;
    totalRelativeError += Math.abs(predLine.unitPrice - expLine.unitPrice) / expLine.unitPrice;
    matched += 1;
  }

  if (matched === 0) return 0;
  const avgError = totalRelativeError / matched;
  return Math.round(Math.max(0, 1 - Math.min(avgError, 1)) * 100);
}

export function computeMeanConfidencePct(scanned: ScannedInvoice): number {
  const docConfidence = scanned.confidence ?? 0;
  if (scanned.lineItems.length === 0) return Math.round(docConfidence * 100);
  const lineAvg =
    scanned.lineItems.reduce((sum, line) => sum + line.confidence, 0) / scanned.lineItems.length;
  return Math.round((docConfidence * 0.4 + lineAvg * 0.6) * 100);
}

export function buildSupplierAccuracyBreakdown(
  fixtures: readonly InvoiceScannerAccuracyFixture[],
): SupplierAccuracyRow[] {
  const bySupplier = new Map<string, ReturnType<typeof scoreScannedInvoice>[]>();

  for (const fixture of fixtures) {
    const supplier = fixture.groundTruth.supplierName ?? "Unknown";
    const expected = mapOcrResultToScannedInvoice(fixture.groundTruth);
    const predicted = mapOcrResultToScannedInvoice(fixture.predicted);
    const score = scoreScannedInvoice(predicted, expected);
    const existing = bySupplier.get(supplier) ?? [];
    existing.push(score);
    bySupplier.set(supplier, existing);
  }

  return [...bySupplier.entries()]
    .map(([supplier, scores]) => ({
      supplier,
      invoiceCount: scores.length,
      supplierAccuracyPct: Math.round(
        (scores.filter((s) => s.supplierMatch).length / scores.length) * 100,
      ),
      amountAccuracyPct: Math.round(
        (scores.filter((s) => s.amountMatch).length / scores.length) * 100,
      ),
      lineItemAccuracyPct: Math.round(
        (scores.filter((s) => s.lineItemCountMatch && s.lineItemDescriptionMatchPct >= 85)
          .length /
          scores.length) *
          100,
      ),
    }))
    .sort((left, right) => right.invoiceCount - left.invoiceCount);
}

export function runInvoiceOcrAccuracyBenchmarkP2_96(
  fixtures: readonly InvoiceScannerAccuracyFixture[],
): InvoiceOcrAccuracyBenchmarkP2_96Result {
  const base = runInvoiceScannerAccuracyBenchmark([...fixtures]);

  const priceScores = fixtures.map((fixture) => {
    const expected = mapOcrResultToScannedInvoice(fixture.groundTruth);
    const predicted = mapOcrResultToScannedInvoice(fixture.predicted);
    return computePriceVarianceAccuracyPct(predicted, expected);
  });

  const confidenceScores = fixtures.map((fixture) => {
    const predicted = mapOcrResultToScannedInvoice(fixture.predicted);
    return computeMeanConfidencePct(predicted);
  });

  const priceVarianceAccuracyPct = Math.round(
    priceScores.reduce((sum, score) => sum + score, 0) / priceScores.length,
  );
  const avgConfidencePct = Math.round(
    confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length,
  );

  const supplierBreakdown = buildSupplierAccuracyBreakdown(fixtures);

  const passed =
    base.invoiceCount >= INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_MIN_INVOICES &&
    base.passed &&
    priceVarianceAccuracyPct >= INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_MIN_ACCURACY_PCT &&
    avgConfidencePct >= 70;

  return {
    policyId: INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_POLICY_ID,
    ...base,
    priceVarianceAccuracyPct,
    avgConfidencePct,
    supplierBreakdown,
    passed,
    minInvoices: INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_MIN_INVOICES,
    thresholdPct: INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_MIN_ACCURACY_PCT,
  };
}

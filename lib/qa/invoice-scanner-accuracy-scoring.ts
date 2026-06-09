import type { ScannedInvoice } from "@/lib/inventory/invoice-scanner-types";
import {
  INVOICE_SCANNER_ACCURACY_MIN_INVOICES,
  INVOICE_SCANNER_ACCURACY_MIN_OVERALL_PCT,
} from "@/lib/qa/invoice-scanner-accuracy-benchmark-policy";
import type { InvoiceScannerAccuracyFixture } from "@/lib/qa/invoice-scanner-accuracy-corpus";
import { mapOcrResultToScannedInvoice as mapFixtureToScannedInvoice } from "@/lib/qa/invoice-scanner-ocr-mapper";

export type InvoiceScannerFieldScores = {
  supplierMatch: boolean;
  amountMatch: boolean;
  lineItemCountMatch: boolean;
  lineItemDescriptionMatchPct: number;
  overallPct: number;
};

export type InvoiceScannerAccuracyBenchmarkResult = {
  invoiceCount: number;
  supplierAccuracyPct: number;
  amountAccuracyPct: number;
  lineItemAccuracyPct: number;
  overallAccuracyPct: number;
  passed: boolean;
  thresholdPct: number;
  minInvoices: number;
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function amountsClose(a: number, b: number, tolerance = 0.02): boolean {
  return Math.abs(a - b) <= tolerance;
}

export function scoreScannedInvoice(
  predicted: ScannedInvoice,
  expected: ScannedInvoice,
): InvoiceScannerFieldScores {
  const supplierMatch =
    normalizeText(predicted.supplier) === normalizeText(expected.supplier);
  const amountMatch = amountsClose(predicted.total, expected.total);

  const lineItemCountMatch = predicted.lineItems.length === expected.lineItems.length;
  let matchedDescriptions = 0;
  const expectedNames = expected.lineItems.map((line) => normalizeText(line.name));
  for (const line of predicted.lineItems) {
    const name = normalizeText(line.name);
    if (expectedNames.some((expectedName) => expectedName === name || expectedName.includes(name) || name.includes(expectedName))) {
      matchedDescriptions += 1;
    }
  }
  const lineItemDescriptionMatchPct =
    predicted.lineItems.length === 0
      ? 0
      : Math.round((matchedDescriptions / predicted.lineItems.length) * 100);

  const checks = [
    supplierMatch,
    amountMatch,
    lineItemCountMatch,
    lineItemDescriptionMatchPct >= 85,
  ];
  const overallPct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return {
    supplierMatch,
    amountMatch,
    lineItemCountMatch,
    lineItemDescriptionMatchPct,
    overallPct,
  };
}

export function runInvoiceScannerAccuracyBenchmark(
  fixtures: InvoiceScannerAccuracyFixture[],
): InvoiceScannerAccuracyBenchmarkResult {
  const scores = fixtures.map((fixture) => {
    const expected = mapFixtureToScannedInvoice(fixture.groundTruth);
    const predicted = mapFixtureToScannedInvoice(fixture.predicted);
    return scoreScannedInvoice(predicted, expected);
  });

  const invoiceCount = fixtures.length;
  const supplierAccuracyPct = Math.round(
    (scores.filter((s) => s.supplierMatch).length / invoiceCount) * 100,
  );
  const amountAccuracyPct = Math.round(
    (scores.filter((s) => s.amountMatch).length / invoiceCount) * 100,
  );
  const lineItemAccuracyPct = Math.round(
    (scores.filter((s) => s.lineItemCountMatch && s.lineItemDescriptionMatchPct >= 85)
      .length /
      invoiceCount) *
      100,
  );
  const overallAccuracyPct = Math.round(
    scores.reduce((sum, s) => sum + s.overallPct, 0) / invoiceCount,
  );

  const passed =
    invoiceCount >= INVOICE_SCANNER_ACCURACY_MIN_INVOICES &&
    supplierAccuracyPct >= INVOICE_SCANNER_ACCURACY_MIN_OVERALL_PCT &&
    amountAccuracyPct >= INVOICE_SCANNER_ACCURACY_MIN_OVERALL_PCT &&
    lineItemAccuracyPct >= INVOICE_SCANNER_ACCURACY_MIN_OVERALL_PCT &&
    overallAccuracyPct >= INVOICE_SCANNER_ACCURACY_MIN_OVERALL_PCT;

  return {
    invoiceCount,
    supplierAccuracyPct,
    amountAccuracyPct,
    lineItemAccuracyPct,
    overallAccuracyPct,
    passed,
    thresholdPct: INVOICE_SCANNER_ACCURACY_MIN_OVERALL_PCT,
    minInvoices: INVOICE_SCANNER_ACCURACY_MIN_INVOICES,
  };
}

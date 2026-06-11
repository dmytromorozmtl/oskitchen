import type { InvoiceScannerAccuracyFixture } from "@/lib/qa/invoice-scanner-accuracy-corpus";
import { mapOcrResultToScannedInvoice } from "@/lib/qa/invoice-scanner-ocr-mapper";
import { scoreScannedInvoice } from "@/lib/qa/invoice-scanner-accuracy-scoring";
import {
  AI_INVOICE_ACCURACY_REGRESSION_MIN_PCT,
  INVOICE_SCANNER_ACCURACY_MIN_INVOICES,
} from "@/lib/qa/ai-invoice-accuracy-regression-policy";

export type AiInvoiceAccuracyRegressionResult = {
  invoiceCount: number;
  supplierAccuracyPct: number;
  amountAccuracyPct: number;
  lineItemAccuracyPct: number;
  overallAccuracyPct: number;
  passed: boolean;
  thresholdPct: number;
  minInvoices: number;
};

export function runAiInvoiceAccuracyRegression(
  fixtures: InvoiceScannerAccuracyFixture[],
): AiInvoiceAccuracyRegressionResult {
  const scores = fixtures.map((fixture) => {
    const expected = mapOcrResultToScannedInvoice(fixture.groundTruth);
    const predicted = mapOcrResultToScannedInvoice(fixture.predicted);
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

  const thresholdPct = AI_INVOICE_ACCURACY_REGRESSION_MIN_PCT;
  const passed =
    invoiceCount >= INVOICE_SCANNER_ACCURACY_MIN_INVOICES &&
    supplierAccuracyPct >= thresholdPct &&
    amountAccuracyPct >= thresholdPct &&
    lineItemAccuracyPct >= thresholdPct &&
    overallAccuracyPct >= thresholdPct;

  return {
    invoiceCount,
    supplierAccuracyPct,
    amountAccuracyPct,
    lineItemAccuracyPct,
    overallAccuracyPct,
    passed,
    thresholdPct,
    minInvoices: INVOICE_SCANNER_ACCURACY_MIN_INVOICES,
  };
}

/** Degrade a few fixtures to prove the 95% regression gate fails when accuracy drops. */
export function buildDegradedInvoiceRegressionFixtures(
  fixtures: InvoiceScannerAccuracyFixture[],
  degradeCount = 3,
): InvoiceScannerAccuracyFixture[] {
  return fixtures.map((fixture, index) => {
    if (index >= degradeCount) {
      return fixture;
    }
    const predicted = structuredClone(fixture.predicted);
    predicted.supplierName = "Wrong Supplier LLC";
    predicted.totalAmount = Number(((predicted.totalAmount ?? 0) + 999).toFixed(2));
    if (predicted.lineItems[0]) {
      predicted.lineItems[0] = {
        ...predicted.lineItems[0],
        description: "Unknown Item",
      };
    }
    return { ...fixture, predicted };
  });
}

import type { InvoiceScannerAccuracyFixture } from "@/lib/qa/invoice-scanner-accuracy-corpus";
import { buildInvoiceScannerAccuracyCorpus } from "@/lib/qa/invoice-scanner-accuracy-corpus";
import { mapOcrResultToScannedInvoice } from "@/lib/qa/invoice-scanner-ocr-mapper";
import { scoreScannedInvoice } from "@/lib/qa/invoice-scanner-accuracy-scoring";
import {
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_INVOICE_COUNT,
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_MIN_PCT,
} from "@/lib/qa/invoice-scanner-accuracy-regression-p2-33-policy";

export type InvoiceScannerAccuracyRegressionP2_33Result = {
  invoiceCount: number;
  supplierAccuracyPct: number;
  amountAccuracyPct: number;
  lineItemAccuracyPct: number;
  overallAccuracyPct: number;
  passed: boolean;
  thresholdPct: number;
  minInvoices: number;
};

export function buildInvoiceScannerAccuracyCorpusP2_33(): InvoiceScannerAccuracyFixture[] {
  return buildInvoiceScannerAccuracyCorpus().slice(
    0,
    INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_INVOICE_COUNT,
  );
}

export function runInvoiceScannerAccuracyRegressionP2_33(
  fixtures: InvoiceScannerAccuracyFixture[],
): InvoiceScannerAccuracyRegressionP2_33Result {
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

  const thresholdPct = INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_MIN_PCT;
  const passed =
    invoiceCount >= INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_INVOICE_COUNT &&
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
    minInvoices: INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_INVOICE_COUNT,
  };
}

/** Degrade fixtures to prove the 80% P2-33 gate fails when accuracy drops. */
export function buildDegradedInvoiceRegressionP2_33Fixtures(
  fixtures: InvoiceScannerAccuracyFixture[],
  degradeCount = 11,
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

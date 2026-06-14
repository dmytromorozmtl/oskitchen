import type { InvoiceOcrFixtureResult } from "@/lib/qa/invoice-scanner-ocr-mapper";
import {
  buildInvoiceOcrAccuracyCorpusP2_96,
  type InvoiceScannerAccuracyFixture,
} from "@/lib/qa/invoice-scanner-accuracy-corpus";
import {
  INVOICE_SCANNER_ACCURACY_P1_38_HEADER_FIELDS,
  INVOICE_SCANNER_ACCURACY_P1_38_INVOICE_COUNT,
  INVOICE_SCANNER_ACCURACY_P1_38_LINE_FIELDS,
  INVOICE_SCANNER_ACCURACY_P1_38_MIN_FIELD_PCT,
} from "@/lib/qa/invoice-scanner-accuracy-p1-38-policy";

export type InvoiceScannerFieldLevelScores = {
  supplierName: boolean;
  invoiceNumber: boolean;
  invoiceDate: boolean;
  dueDate: boolean;
  totalAmount: boolean;
  taxAmount: boolean;
  lineFieldMatches: number;
  lineFieldTotal: number;
  fieldAccuracyPct: number;
};

export type InvoiceScannerAccuracyP138FieldSummary = {
  supplierNamePct: number;
  invoiceNumberPct: number;
  invoiceDatePct: number;
  dueDatePct: number;
  totalAmountPct: number;
  taxAmountPct: number;
  lineDescriptionPct: number;
  lineQuantityPct: number;
  lineUnitPricePct: number;
  lineTotalPricePct: number;
};

export type InvoiceScannerAccuracyP138Result = {
  invoiceCount: number;
  fieldSummary: InvoiceScannerAccuracyP138FieldSummary;
  fieldAccuracyPct: number;
  passed: boolean;
  thresholdPct: number;
  minInvoices: number;
};

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function amountsClose(a: number | null | undefined, b: number | null | undefined): boolean {
  if (a == null || b == null) return a === b;
  return Math.abs(a - b) <= 0.02;
}

export function scoreInvoiceOcrFieldLevel(
  predicted: InvoiceOcrFixtureResult,
  groundTruth: InvoiceOcrFixtureResult,
): InvoiceScannerFieldLevelScores {
  const headerMatches = {
    supplierName: normalizeText(predicted.supplierName) === normalizeText(groundTruth.supplierName),
    invoiceNumber:
      normalizeText(predicted.invoiceNumber) === normalizeText(groundTruth.invoiceNumber),
    invoiceDate: normalizeText(predicted.invoiceDate) === normalizeText(groundTruth.invoiceDate),
    dueDate: normalizeText(predicted.dueDate) === normalizeText(groundTruth.dueDate),
    totalAmount: amountsClose(predicted.totalAmount, groundTruth.totalAmount),
    taxAmount: amountsClose(predicted.taxAmount, groundTruth.taxAmount),
  };

  let lineFieldMatches = 0;
  let lineFieldTotal = 0;
  const maxLines = Math.max(predicted.lineItems.length, groundTruth.lineItems.length);

  for (let i = 0; i < maxLines; i += 1) {
    const pred = predicted.lineItems[i];
    const truth = groundTruth.lineItems[i];
    lineFieldTotal += INVOICE_SCANNER_ACCURACY_P1_38_LINE_FIELDS.length;

    if (!pred || !truth) continue;

    if (normalizeText(pred.description) === normalizeText(truth.description)) lineFieldMatches += 1;
    if (pred.quantity === truth.quantity) lineFieldMatches += 1;
    if (amountsClose(pred.unitPrice, truth.unitPrice)) lineFieldMatches += 1;
    if (amountsClose(pred.totalPrice, truth.totalPrice)) lineFieldMatches += 1;
  }

  const headerTotal = INVOICE_SCANNER_ACCURACY_P1_38_HEADER_FIELDS.length;
  const headerMatchesCount = Object.values(headerMatches).filter(Boolean).length;
  const totalFields = headerTotal + lineFieldTotal;
  const matchedFields = headerMatchesCount + lineFieldMatches;
  const fieldAccuracyPct =
    totalFields === 0 ? 0 : Math.round((matchedFields / totalFields) * 100);

  return {
    ...headerMatches,
    lineFieldMatches,
    lineFieldTotal,
    fieldAccuracyPct,
  };
}

export function buildInvoiceScannerAccuracyCorpusP138(): InvoiceScannerAccuracyFixture[] {
  return buildInvoiceOcrAccuracyCorpusP2_96();
}

export function runInvoiceScannerAccuracyP138(
  fixtures: InvoiceScannerAccuracyFixture[],
): InvoiceScannerAccuracyP138Result {
  const scores = fixtures.map((fixture) =>
    scoreInvoiceOcrFieldLevel(fixture.predicted, fixture.groundTruth),
  );

  const invoiceCount = fixtures.length;
  const pct = (matched: number) =>
    invoiceCount === 0 ? 0 : Math.round((matched / invoiceCount) * 100);

  const fieldSummary: InvoiceScannerAccuracyP138FieldSummary = {
    supplierNamePct: pct(scores.filter((s) => s.supplierName).length),
    invoiceNumberPct: pct(scores.filter((s) => s.invoiceNumber).length),
    invoiceDatePct: pct(scores.filter((s) => s.invoiceDate).length),
    dueDatePct: pct(scores.filter((s) => s.dueDate).length),
    totalAmountPct: pct(scores.filter((s) => s.totalAmount).length),
    taxAmountPct: pct(scores.filter((s) => s.taxAmount).length),
    lineDescriptionPct: 0,
    lineQuantityPct: 0,
    lineUnitPricePct: 0,
    lineTotalPricePct: 0,
  };

  let descMatches = 0;
  let qtyMatches = 0;
  let unitMatches = 0;
  let totalLineMatches = 0;
  let lineRows = 0;

  for (const fixture of fixtures) {
    const maxLines = Math.max(fixture.predicted.lineItems.length, fixture.groundTruth.lineItems.length);
    for (let i = 0; i < maxLines; i += 1) {
      const pred = fixture.predicted.lineItems[i];
      const truth = fixture.groundTruth.lineItems[i];
      if (!pred || !truth) continue;
      lineRows += 1;
      if (normalizeText(pred.description) === normalizeText(truth.description)) descMatches += 1;
      if (pred.quantity === truth.quantity) qtyMatches += 1;
      if (amountsClose(pred.unitPrice, truth.unitPrice)) unitMatches += 1;
      if (amountsClose(pred.totalPrice, truth.totalPrice)) totalLineMatches += 1;
    }
  }

  if (lineRows > 0) {
    fieldSummary.lineDescriptionPct = Math.round((descMatches / lineRows) * 100);
    fieldSummary.lineQuantityPct = Math.round((qtyMatches / lineRows) * 100);
    fieldSummary.lineUnitPricePct = Math.round((unitMatches / lineRows) * 100);
    fieldSummary.lineTotalPricePct = Math.round((totalLineMatches / lineRows) * 100);
  }

  const fieldAccuracyPct =
    scores.length === 0
      ? 0
      : Math.round(scores.reduce((sum, s) => sum + s.fieldAccuracyPct, 0) / scores.length);

  const thresholdPct = INVOICE_SCANNER_ACCURACY_P1_38_MIN_FIELD_PCT;
  const passed =
    invoiceCount >= INVOICE_SCANNER_ACCURACY_P1_38_INVOICE_COUNT &&
    fieldAccuracyPct >= thresholdPct &&
    fieldSummary.supplierNamePct >= thresholdPct &&
    fieldSummary.totalAmountPct >= thresholdPct;

  return {
    invoiceCount,
    fieldSummary,
    fieldAccuracyPct,
    passed,
    thresholdPct,
    minInvoices: INVOICE_SCANNER_ACCURACY_P1_38_INVOICE_COUNT,
  };
}

/** Degrade fixtures to prove the P1-38 gate fails when field accuracy drops. */
export function buildDegradedInvoiceAccuracyP138Fixtures(
  fixtures: InvoiceScannerAccuracyFixture[],
  degradeCount = 20,
): InvoiceScannerAccuracyFixture[] {
  return fixtures.map((fixture, index) => {
    if (index >= degradeCount) return fixture;
    const predicted = structuredClone(fixture.predicted);
    predicted.supplierName = "Wrong Supplier";
    predicted.invoiceNumber = "WRONG-000";
    predicted.totalAmount = Number(((predicted.totalAmount ?? 0) + 500).toFixed(2));
    return { ...fixture, predicted };
  });
}

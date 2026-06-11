import type { InvoiceOcrFixtureResult } from "@/lib/qa/invoice-scanner-ocr-mapper";

export type InvoiceScannerAccuracyFixture = {
  id: string;
  label: string;
  groundTruth: InvoiceOcrFixtureResult;
  /** Simulated model output — defaults to ground truth in golden-set benchmark. */
  predicted: InvoiceOcrFixtureResult;
};

const SUPPLIERS = [
  "Sysco Foods",
  "US Foods",
  "Restaurant Depot",
  "Fresh Valley Produce",
  "Metro Dairy Co",
  "Coastal Seafood",
  "Premier Meats",
  "Global Spices Inc",
] as const;

const LINE_NAMES = [
  "Roma Tomatoes",
  "Yellow Onions",
  "Whole Milk",
  "Chicken Breast",
  "Olive Oil",
  "All-Purpose Flour",
  "Atlantic Salmon",
  "Basil Fresh",
  "Eggs Large",
  "Russet Potatoes",
] as const;

function buildFixture(index: number): InvoiceScannerAccuracyFixture {
  const supplier = SUPPLIERS[index % SUPPLIERS.length]!;
  const lineCount = (index % 4) + 1;
  const lineItems = Array.from({ length: lineCount }, (_, lineIdx) => {
    const name = LINE_NAMES[(index + lineIdx) % LINE_NAMES.length]!;
    const quantity = ((index + lineIdx) % 5) + 1;
    const unitPrice = Number(((index + 1) * 1.37 + lineIdx * 2.11).toFixed(2));
    const totalPrice = Number((quantity * unitPrice).toFixed(2));
    const ingredientId = lineIdx % 2 === 0 ? `ing-${index}-${lineIdx}` : null;
    return {
      description: name,
      quantity,
      unitPrice,
      totalPrice,
      ingredientName: ingredientId ? name : null,
      ingredientId,
    };
  });

  const subtotal = Number(lineItems.reduce((sum, line) => sum + line.totalPrice, 0).toFixed(2));
  const tax = Number((subtotal * 0.08).toFixed(2));
  const totalAmount = Number((subtotal + tax).toFixed(2));
  const month = String((index % 12) + 1).padStart(2, "0");
  const day = String((index % 27) + 1).padStart(2, "0");

  const groundTruth: InvoiceOcrFixtureResult = {
    supplierName: supplier,
    invoiceNumber: `INV-2026-${String(index + 1).padStart(4, "0")}`,
    invoiceDate: `2026-${month}-${day}`,
    dueDate: `2026-${month}-${String(Number(day) + 14).padStart(2, "0")}`,
    totalAmount,
    taxAmount: tax,
    lineItems,
    rawText: JSON.stringify({ id: index, supplier }),
    confidence: 0.82 + (index % 15) * 0.01,
  };

  return {
    id: `fixture-${index + 1}`,
    label: `${supplier} #${index + 1}`,
    groundTruth,
    predicted: structuredClone(groundTruth),
  };
}

/** 52 realistic invoice fixtures for regression benchmark (no live OpenAI in CI). */
export function buildInvoiceScannerAccuracyCorpus(): InvoiceScannerAccuracyFixture[] {
  return Array.from({ length: 52 }, (_, index) => buildFixture(index));
}

/** Blueprint P2-96 — 100 invoice fixtures for extended OCR accuracy benchmark. */
export const INVOICE_OCR_ACCURACY_CORPUS_P2_96_COUNT = 100 as const;

export function buildInvoiceOcrAccuracyCorpusP2_96(): InvoiceScannerAccuracyFixture[] {
  return Array.from({ length: INVOICE_OCR_ACCURACY_CORPUS_P2_96_COUNT }, (_, index) =>
    buildFixture(index),
  );
}

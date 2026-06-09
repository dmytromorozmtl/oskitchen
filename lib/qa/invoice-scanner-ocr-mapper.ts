import type {
  ScannedInvoice,
  ScannedInvoiceLineItem,
} from "@/lib/inventory/invoice-scanner-types";

/** OCR-shaped fixture used by accuracy benchmark (no server-only deps). */
export type InvoiceOcrFixtureResult = {
  supplierName: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  totalAmount: number | null;
  taxAmount: number | null;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    ingredientName: string | null;
    ingredientId: string | null;
  }>;
  rawText: string;
  confidence: number;
};

function lineConfidenceFromMatch(ingredientId: string | null | undefined): number {
  if (ingredientId) return 0.92;
  return 0.58;
}

function computeOverallConfidence(
  ocrConfidence: number,
  lineItems: ScannedInvoiceLineItem[],
): number {
  if (lineItems.length === 0) return ocrConfidence;
  const avgLine =
    lineItems.reduce((sum, line) => sum + line.confidence, 0) / lineItems.length;
  return Math.round((ocrConfidence * 0.4 + avgLine * 0.6) * 100) / 100;
}

export function mapOcrResultToScannedInvoice(ocr: InvoiceOcrFixtureResult): ScannedInvoice {
  const lineItems: ScannedInvoiceLineItem[] = ocr.lineItems.map((item) => ({
    name: item.description,
    quantity: item.quantity,
    unit: "each",
    unitPrice: item.unitPrice,
    total: item.totalPrice,
    confidence: lineConfidenceFromMatch(item.ingredientId),
    ingredientId: item.ingredientId ?? null,
    matchedIngredientName: item.ingredientName ?? null,
  }));

  const subtotal = lineItems.reduce((sum, line) => sum + line.total, 0);
  const tax = ocr.taxAmount ?? 0;
  const total = ocr.totalAmount ?? subtotal + tax;

  return {
    supplier: ocr.supplierName ?? "",
    invoiceNumber: ocr.invoiceNumber ?? "",
    date: ocr.invoiceDate ?? new Date().toISOString().slice(0, 10),
    dueDate: ocr.dueDate ?? "",
    lineItems,
    subtotal,
    tax,
    total,
    confidence: computeOverallConfidence(ocr.confidence, lineItems),
    rawText: ocr.rawText,
  };
}

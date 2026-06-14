import { PHOTO_INVOICE_AI_P2_68_SUPPLIER_DOC_STATUS } from "@/lib/ai/photo-invoice-ai-p2-68-policy";
import type { ScannedInvoice, ScannedInvoiceLineItem } from "@/lib/inventory/invoice-scanner-types";

export type SupplierDocumentLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  confidence: number;
};

export type SupplierDocumentDraft = {
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  lineItems: SupplierDocumentLineItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  receiptImageUrl: string | null;
  confidence: number;
  documentStatus: typeof PHOTO_INVOICE_AI_P2_68_SUPPLIER_DOC_STATUS;
  notes: string;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function mapLineItem(line: ScannedInvoiceLineItem): SupplierDocumentLineItem {
  return {
    description: line.name.trim(),
    quantity: line.quantity,
    unitPrice: round2(line.unitPrice),
    totalPrice: round2(line.total),
    confidence: line.confidence,
  };
}

export function buildSupplierDocumentFromScannedInvoice(
  invoice: ScannedInvoice,
): SupplierDocumentDraft {
  const lineItems = invoice.lineItems
    .filter((line) => line.quantity > 0 && line.name.trim().length > 0)
    .map(mapLineItem);

  const subtotal =
    lineItems.length > 0
      ? round2(lineItems.reduce((sum, line) => sum + line.totalPrice, 0))
      : round2(invoice.subtotal);

  const taxAmount = round2(invoice.tax);
  const totalAmount = round2(invoice.total || subtotal + taxAmount);

  return {
    supplierName: invoice.supplier.trim() || "Unknown Vendor",
    invoiceNumber: invoice.invoiceNumber.trim() || `RECEIPT-${Date.now()}`,
    invoiceDate: invoice.date || new Date().toISOString().slice(0, 10),
    dueDate: invoice.dueDate?.trim() ? invoice.dueDate : null,
    lineItems,
    subtotal,
    taxAmount,
    totalAmount,
    receiptImageUrl: invoice.imageUrl ?? null,
    confidence: invoice.confidence,
    documentStatus: PHOTO_INVOICE_AI_P2_68_SUPPLIER_DOC_STATUS,
    notes: "Paper receipt → supplier document (Poster POS parity). Review before approval.",
  };
}

export function isSupplierDocumentReadyForCreation(draft: SupplierDocumentDraft): boolean {
  return (
    draft.lineItems.length > 0 &&
    draft.supplierName.trim().length > 0 &&
    draft.totalAmount > 0 &&
    draft.documentStatus === PHOTO_INVOICE_AI_P2_68_SUPPLIER_DOC_STATUS
  );
}

export function countLowConfidenceLines(
  draft: SupplierDocumentDraft,
  threshold = 0.7,
): number {
  return draft.lineItems.filter((line) => line.confidence < threshold).length;
}

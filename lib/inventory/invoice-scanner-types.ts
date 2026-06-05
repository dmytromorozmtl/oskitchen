/** Client-safe types and helpers for the AI Invoice Scanner. */

/** Marker stored on supplier invoices created via the inventory invoice scanner. */
export const INVOICE_SCANNER_NOTES_MARKER = "AI-assisted invoice scanning";

export interface ScannedInvoiceLineItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  confidence: number;
  ingredientId?: string | null;
  matchedIngredientName?: string | null;
}

export interface ScannedInvoice {
  supplier: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  lineItems: ScannedInvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  confidence: number;
  rawText: string;
  imageUrl?: string;
}

export type InvoiceScanHistoryEntry = {
  id: string;
  supplier: string;
  invoiceNumber: string;
  total: number;
  confidence: number;
  scannedAt: string;
  purchaseOrderId: string | null;
  imageUrl: string | null;
};

export type CreateSupplyFromInvoiceResult = {
  purchaseOrderId: string;
  orderNumber: string;
  supplierInvoiceId: string;
  linesReceived: number;
  stockUpdated: number;
};

export function confidenceBadgeVariant(
  confidence: number,
): "default" | "secondary" | "destructive" {
  if (confidence >= 0.9) return "default";
  if (confidence >= 0.7) return "secondary";
  return "destructive";
}

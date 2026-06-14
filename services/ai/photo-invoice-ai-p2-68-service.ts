import { buildSupplierDocumentFromScannedInvoice } from "@/lib/ai/photo-invoice-ai-p2-68-builder";
import { PHOTO_INVOICE_AI_P2_68_POLICY_ID } from "@/lib/ai/photo-invoice-ai-p2-68-policy";
import type { ScannedInvoice } from "@/lib/inventory/invoice-scanner-types";

export { buildSupplierDocumentFromScannedInvoice };

export function previewSupplierDocumentFromReceipt(invoice: ScannedInvoice) {
  return {
    policyId: PHOTO_INVOICE_AI_P2_68_POLICY_ID,
    document: buildSupplierDocumentFromScannedInvoice(invoice),
  };
}

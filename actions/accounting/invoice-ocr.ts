"use server";


import { fail, ok } from "@/lib/action-result";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { matchInvoiceToPurchaseOrder } from "@/services/accounting/ocr-service";

export async function uploadInvoiceOcrAction(formData: FormData) {
  const { dataUserId } = await requireTenantActor();
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Upload an image file" };

  const buf = Buffer.from(await file.arrayBuffer());
  const { processInvoiceWithOCR } = await import("@/services/accounting/ocr-service");
  const ocr = await processInvoiceWithOCR(buf.toString("base64"), dataUserId);
  const match = await matchInvoiceToPurchaseOrder(dataUserId, ocr);
  return { ok: true as const, ocr, match };
}

"use server";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { validateInvoiceOcrImageUpload } from "@/lib/upload-policy/media-upload-validation";
import { logUploadDenied, logUploadSucceeded } from "@/services/audit/upload-audit";
import { matchInvoiceToPurchaseOrder } from "@/services/accounting/ocr-service";

export async function uploadInvoiceOcrAction(formData: FormData) {
  const access = await requireMutationPermission("reports.read.financial");
  if (!access.ok) {
    return { error: access.error };
  }

  const { dataUserId, sessionUser, workspaceId } = await requireTenantActor();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Upload an image file" };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const validated = validateInvoiceOcrImageUpload({
    bytes,
    mimeType: file.type || "",
  });
  if (!validated.ok) {
    void logUploadDenied({
      channel: "invoice_ocr_image",
      actorUserId: sessionUser.id,
      workspaceId,
      entity: { type: "InvoiceOCR", id: "upload" },
      mimeType: file.type || null,
      sizeBytes: bytes.byteLength,
      reason: validated.error,
    });
    return { error: validated.error };
  }

  const { processInvoiceWithOCR } = await import("@/services/accounting/ocr-service");
  const ocr = await processInvoiceWithOCR(Buffer.from(bytes).toString("base64"), dataUserId);
  const match = await matchInvoiceToPurchaseOrder(dataUserId, ocr);

  void logUploadSucceeded({
    channel: "invoice_ocr_image",
    actorUserId: sessionUser.id,
    workspaceId,
    entity: { type: "InvoiceOCR", id: "upload" },
    mimeType: validated.mimeType,
    sizeBytes: bytes.byteLength,
    metadata: { confidence: ocr.confidence },
  });

  return { ok: true as const, ocr, match };
}

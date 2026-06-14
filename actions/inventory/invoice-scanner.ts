"use server";

import { revalidatePath } from "next/cache";

import { fail, ok } from "@/lib/action-result";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { enforceUploadContentSafety } from "@/lib/upload-policy/enforce-upload-content-safety";
import { validateInvoiceOcrImageUpload } from "@/lib/upload-policy/media-upload-validation";
import { uploadKitchenAsset } from "@/lib/storage";
import { logUploadDenied, logUploadSucceeded } from "@/services/audit/upload-audit";
import {
  createDraftPurchaseOrderFromInvoice,
  createSupplyFromInvoice,
  scanInvoice,
  type ScannedInvoice,
} from "@/services/ai/invoice-scanner-service";

export async function scanInvoiceAction(formData: FormData) {
  const access = await requireMutationPermission("production.manage");
  if (!access.ok) return fail(access.error);

  const { dataUserId, sessionUser, workspaceId } = await requireTenantActor();
  if (!workspaceId) {
    return fail("Complete workspace setup before scanning invoices.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return fail("Upload an invoice photo.");
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
      entity: { type: "InvoiceScanner", id: "upload" },
      mimeType: file.type || null,
      sizeBytes: bytes.byteLength,
      reason: validated.error,
    });
    return fail(validated.error);
  }

  const safe = await enforceUploadContentSafety({
    bytes,
    mimeType: validated.mimeType,
    channel: "invoice_ocr_image",
    actorUserId: sessionUser.id,
    workspaceId,
    entity: { type: "InvoiceScanner", id: "upload" },
  });
  if (!safe.ok) {
    return fail(safe.error);
  }

  const imageBase64 = Buffer.from(bytes).toString("base64");
  const scanned = await scanInvoice(imageBase64, workspaceId);

  let imageUrl: string | undefined;
  const upload = await uploadKitchenAsset({
    bucket: "product-images",
    path: `${dataUserId}/invoice-scans/${crypto.randomUUID()}.jpg`,
    bytes,
    contentType: validated.mimeType,
  });
  if (!("error" in upload)) {
    imageUrl = upload.publicUrl;
  }

  void logUploadSucceeded({
    channel: "invoice_ocr_image",
    actorUserId: sessionUser.id,
    workspaceId,
    entity: { type: "InvoiceScanner", id: "upload" },
    mimeType: validated.mimeType,
    sizeBytes: bytes.byteLength,
    metadata: { confidence: scanned.confidence, imageUrl },
  });

  return ok({
    scanned: { ...scanned, imageUrl },
  });
}

export async function confirmInvoiceScanDraftPoAction(invoice: ScannedInvoice) {
  const access = await requireMutationPermission("production.manage");
  if (!access.ok) return fail(access.error);

  const { dataUserId, sessionUser, workspaceId } = await requireTenantActor();

  try {
    const result = await createDraftPurchaseOrderFromInvoice(dataUserId, workspaceId, invoice, {
      performedById: sessionUser.id,
      imageUrl: invoice.imageUrl,
    });

    revalidatePath("/dashboard/inventory/invoice-scanner");
    revalidatePath("/dashboard/purchasing");
    revalidatePath("/dashboard/accounting/invoices");
    revalidatePath(`/dashboard/purchasing/purchase-orders/${result.purchaseOrderId}`);

    return ok(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create draft PO.";
    return fail(message);
  }
}

export async function confirmInvoiceScanAction(invoice: ScannedInvoice) {
  const access = await requireMutationPermission("production.manage");
  if (!access.ok) return fail(access.error);

  const { dataUserId, sessionUser, workspaceId } = await requireTenantActor();

  try {
    const result = await createSupplyFromInvoice(dataUserId, workspaceId, invoice, {
      performedById: sessionUser.id,
      imageUrl: invoice.imageUrl,
    });

    revalidatePath("/dashboard/inventory/invoice-scanner");
    revalidatePath("/dashboard/inventory/receiving");
    revalidatePath("/dashboard/purchasing");
    revalidatePath("/dashboard/accounting/invoices");

    return ok(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create supply receipt.";
    return fail(message);
  }
}

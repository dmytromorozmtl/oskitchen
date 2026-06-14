"use server";

import { revalidatePath } from "next/cache";

import { fail, ok } from "@/lib/action-result";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { enforceUploadContentSafety } from "@/lib/upload-policy/enforce-upload-content-safety";
import { validateInvoiceOcrImageUpload } from "@/lib/upload-policy/media-upload-validation";
import { logUploadDenied } from "@/services/audit/upload-audit";
import {
  applyShelfCountsToInventoryCount,
  matchShelfCountsForUser,
  scanShelfPhotoForCounts,
} from "@/services/ai/inventory-photo-count-service";
import type { MatchedShelfCountLine, ShelfPhotoCountResult } from "@/lib/inventory/inventory-photo-count-types";

export async function scanShelfPhotoCountAction(formData: FormData) {
  const access = await requireMutationPermission("production.manage");
  if (!access.ok) return fail(access.error);

  const { dataUserId, sessionUser, workspaceId } = await requireTenantActor();
  if (!workspaceId) {
    return fail("Complete workspace setup before scanning shelf photos.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return fail("Upload a shelf photo.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const validated = validateInvoiceOcrImageUpload({
    bytes,
    mimeType: file.type || "",
  });
  if (!validated.ok) {
    void logUploadDenied({
      channel: "inventory_photo_count",
      actorUserId: sessionUser.id,
      workspaceId,
      entity: { type: "InventoryPhotoCount", id: "upload" },
      mimeType: file.type || null,
      sizeBytes: bytes.byteLength,
      reason: validated.error,
    });
    return fail(validated.error);
  }

  const safe = await enforceUploadContentSafety({
    bytes,
    mimeType: validated.mimeType,
    channel: "inventory_photo_count",
    actorUserId: sessionUser.id,
    workspaceId,
    entity: { type: "InventoryPhotoCount", id: "upload" },
  });
  if (!safe.ok) {
    return fail(safe.error);
  }

  const base64 = Buffer.from(bytes).toString("base64");
  const scan = await scanShelfPhotoForCounts(base64, dataUserId, workspaceId);
  const matched = await matchShelfCountsForUser(dataUserId, scan.detections);

  return ok({
    scan,
    matched,
  } satisfies { scan: ShelfPhotoCountResult; matched: MatchedShelfCountLine[] });
}

export async function applyShelfPhotoCountsAction(formData: FormData) {
  const access = await requireMutationPermission("production.manage");
  if (!access.ok) return fail(access.error);

  const { dataUserId } = await requireTenantActor();
  const countId = String(formData.get("countId") ?? "").trim();
  if (!countId) return fail("Select an inventory count.");

  const rawLines = formData.get("lines");
  if (typeof rawLines !== "string" || !rawLines.trim()) {
    return fail("No shelf count lines to apply.");
  }

  let lines: MatchedShelfCountLine[];
  try {
    lines = JSON.parse(rawLines) as MatchedShelfCountLine[];
  } catch {
    return fail("Invalid shelf count payload.");
  }

  const result = await applyShelfCountsToInventoryCount(dataUserId, countId, lines);
  revalidatePath("/dashboard/inventory/counts");
  revalidatePath(`/dashboard/inventory/counts/${countId}`);
  revalidatePath("/dashboard/inventory/photo-count");

  return ok(result);
}

import type { AuditLogSource } from "@prisma/client";

import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import type { AuditRequestContext } from "@/lib/audit/audit-types";
import { prisma } from "@/lib/prisma";
import { auditLog, resolveWorkspaceIdForOwner } from "@/services/audit/audit-service";

export type UploadAuditChannel =
  | "storefront_media"
  | "kitchen_product_image"
  | "kitchen_business_logo"
  | "profile_avatar"
  | "invoice_ocr_image"
  | "inventory_photo_count"
  | "import_csv"
  | "storefront_form_attachment";

type UploadAuditBase = {
  channel: UploadAuditChannel;
  actorUserId?: string | null;
  workspaceId?: string | null;
  entity?: { type: string; id?: string | null; label?: string | null };
  mimeType?: string | null;
  sizeBytes?: number | null;
  metadata?: Record<string, unknown>;
  request?: AuditRequestContext;
  source?: AuditLogSource;
};

async function resolveWorkspaceId(input: UploadAuditBase): Promise<string | null> {
  if (input.workspaceId) return input.workspaceId;
  if (input.actorUserId) {
    return resolveWorkspaceIdForOwner(input.actorUserId);
  }
  const storeSlug = input.metadata?.storeSlug;
  if (typeof storeSlug === "string" && storeSlug.trim()) {
    const storefront = await prisma.storefrontSettings.findFirst({
      where: { storeSlug: storeSlug.trim() },
      select: { userId: true },
    });
    if (storefront?.userId) {
      return resolveWorkspaceIdForOwner(storefront.userId);
    }
  }
  return null;
}

function uploadEntity(channel: UploadAuditChannel, entity?: UploadAuditBase["entity"]) {
  return entity ?? { type: "Upload", id: channel, label: channel };
}

function uploadMetadata(input: UploadAuditBase, extra?: Record<string, unknown>) {
  return {
    channel: input.channel,
    mimeType: input.mimeType ?? null,
    sizeBytes: input.sizeBytes ?? null,
    ...input.metadata,
    ...extra,
  };
}

function uploadSource(input: UploadAuditBase): AuditLogSource {
  if (input.source) return input.source;
  return input.actorUserId ? "USER" : "API";
}

export async function logUploadDenied(
  input: UploadAuditBase & { reason: string },
): Promise<void> {
  const workspaceId = await resolveWorkspaceId(input);
  await auditLog({
    workspaceId,
    actor: { userId: input.actorUserId ?? null },
    action: AUDIT_ACTIONS.UPLOAD_DENIED,
    category: "SECURITY",
    source: uploadSource(input),
    severity: "WARNING",
    entity: uploadEntity(input.channel, input.entity),
    metadata: uploadMetadata(input, { reason: input.reason }),
    request: input.request,
  });
}

export async function logUploadSucceeded(
  input: UploadAuditBase & { assetId?: string | null; publicUrl?: string | null },
): Promise<void> {
  const workspaceId = await resolveWorkspaceId(input);
  await auditLog({
    workspaceId,
    actor: { userId: input.actorUserId ?? null },
    action: AUDIT_ACTIONS.UPLOAD_SUCCEEDED,
    category: "SECURITY",
    source: uploadSource(input),
    severity: "INFO",
    entity: uploadEntity(input.channel, input.entity),
    metadata: uploadMetadata(input, {
      assetId: input.assetId ?? null,
      hasPublicUrl: Boolean(input.publicUrl),
    }),
    request: input.request,
  });
}

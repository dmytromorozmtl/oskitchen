"use server";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import type { UploadBucket } from "@/lib/storage";
import { uploadKitchenAsset } from "@/lib/storage";
import { enforceUploadContentSafety } from "@/lib/upload-policy/enforce-upload-content-safety";
import {
  kitchenRasterImageExtension,
  validateKitchenRasterImageUpload,
} from "@/lib/upload-policy/media-upload-validation";
import type { UploadAuditChannel } from "@/services/audit/upload-audit";
import { logUploadDenied, logUploadSucceeded } from "@/services/audit/upload-audit";

async function uploadKitchenImageFromFile(params: {
  channel: UploadAuditChannel;
  bucket: UploadBucket;
  buildPath: (ext: ReturnType<typeof kitchenRasterImageExtension>) => string;
  file: File;
  actorUserId: string;
  workspaceId: string | null;
}): Promise<{ publicUrl: string } | { error: string }> {
  const bytes = new Uint8Array(await params.file.arrayBuffer());
  const validated = validateKitchenRasterImageUpload({
    bytes,
    mimeType: params.file.type || "",
  });
  if (!validated.ok) {
    void logUploadDenied({
      channel: params.channel,
      actorUserId: params.actorUserId,
      workspaceId: params.workspaceId,
      entity: { type: "UploadBucket", id: params.bucket },
      mimeType: params.file.type || null,
      sizeBytes: bytes.byteLength,
      reason: validated.error,
    });
    return { error: validated.error };
  }

  const safe = await enforceUploadContentSafety({
    bytes,
    mimeType: validated.mimeType,
    channel: params.channel,
    actorUserId: params.actorUserId,
    workspaceId: params.workspaceId,
    entity: { type: "UploadBucket", id: params.bucket },
  });
  if (!safe.ok) {
    return { error: safe.error };
  }

  const ext = kitchenRasterImageExtension(validated.mimeType);
  const result = await uploadKitchenAsset({
    bucket: params.bucket,
    path: params.buildPath(ext),
    bytes,
    contentType: validated.mimeType,
  });

  if ("error" in result) {
    void logUploadDenied({
      channel: params.channel,
      actorUserId: params.actorUserId,
      workspaceId: params.workspaceId,
      entity: { type: "UploadBucket", id: params.bucket },
      mimeType: validated.mimeType,
      sizeBytes: bytes.byteLength,
      reason: result.error,
    });
    return { error: result.error };
  }

  void logUploadSucceeded({
    channel: params.channel,
    actorUserId: params.actorUserId,
    workspaceId: params.workspaceId,
    entity: { type: "UploadBucket", id: params.bucket },
    mimeType: validated.mimeType,
    sizeBytes: bytes.byteLength,
    publicUrl: result.publicUrl,
    metadata: {
      malwareScanEnabled: safe.scan.enabled,
      malwareScanLayer: safe.scan.enabled ? safe.scan.layer : null,
      malwareScanVerdict: safe.scan.enabled ? safe.scan.verdict : null,
    },
  });

  return result;
}

export async function uploadProductImageAction(formData: FormData) {
  const access = await requireMutationPermission("products.edit");
  if (!access.ok) {
    return { error: access.error };
  }
  const { sessionUser: user, workspaceId } = await requireTenantActor();
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Missing file" };

  const result = await uploadKitchenImageFromFile({
    channel: "kitchen_product_image",
    bucket: "product-images",
    buildPath: (ext) => `${user.id}/${crypto.randomUUID()}.${ext}`,
    file,
    actorUserId: user.id,
    workspaceId,
  });

  if ("error" in result) return { error: result.error };
  return { publicUrl: result.publicUrl };
}

export async function uploadBusinessLogoAction(formData: FormData) {
  const access = await requireMutationPermission("workspace.settings");
  if (!access.ok) {
    return { error: access.error };
  }
  const { sessionUser: user, workspaceId } = await requireTenantActor();
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Missing file" };

  const result = await uploadKitchenImageFromFile({
    channel: "kitchen_business_logo",
    bucket: "business-logos",
    buildPath: (ext) => `${user.id}/logo.${ext}`,
    file,
    actorUserId: user.id,
    workspaceId,
  });

  if ("error" in result) return { error: result.error };
  return { publicUrl: result.publicUrl };
}

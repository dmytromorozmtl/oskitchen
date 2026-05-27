import { randomUUID } from "crypto";

import { createClient } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";
import { resolveConfiguredStorefrontStorageProvider } from "@/lib/storefront/storage-provider";
import { enforceUploadContentSafety } from "@/lib/upload-policy/enforce-upload-content-safety";
import { validateStorefrontMediaUpload } from "@/lib/storefront/asset-validation";
import { prisma } from "@/lib/prisma";
import { logUploadDenied, logUploadSucceeded } from "@/services/audit/upload-audit";
import { assertStorefrontAssetUploadAllowed } from "@/services/storefront/storefront-asset-service";

function storefrontBucketName(): string | null {
  return (
    process.env.STOREFRONT_SUPABASE_STORAGE_BUCKET?.trim() ||
    process.env.STOREFRONT_MEDIA_UPLOAD_BUCKET?.trim() ||
    null
  );
}

async function uploadToSupabase(params: {
  bucket: string;
  path: string;
  bytes: Uint8Array;
  contentType: string;
}): Promise<{ publicUrl: string } | { error: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return { error: "Supabase Storage requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." };
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.storage.from(params.bucket).upload(params.path, params.bytes, {
    contentType: params.contentType,
    upsert: false,
  });

  if (error) {
    logger.error("Storefront media upload failed", error);
    return { error: error.message };
  }

  const { data } = supabase.storage.from(params.bucket).getPublicUrl(params.path);
  return { publicUrl: data.publicUrl };
}

async function uploadToS3Compatible(params: {
  bucket: string;
  path: string;
  bytes: Uint8Array;
  contentType: string;
}): Promise<{ publicUrl: string } | { error: string }> {
  const region = process.env.STOREFRONT_S3_REGION?.trim();
  const accessKey = process.env.STOREFRONT_S3_ACCESS_KEY_ID?.trim();
  const secretKey = process.env.STOREFRONT_S3_SECRET_ACCESS_KEY?.trim();
  const publicBase = process.env.STOREFRONT_S3_PUBLIC_BASE_URL?.trim();

  if (!region || !accessKey || !secretKey) {
    return { error: "S3 credentials are incomplete (region, access key, secret)." };
  }

  const key = params.path.replace(/^\//, "");

  try {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      ...(process.env.STOREFRONT_S3_ENDPOINT?.trim()
        ? { endpoint: process.env.STOREFRONT_S3_ENDPOINT.trim(), forcePathStyle: true }
        : {}),
    });
    await client.send(
      new PutObjectCommand({
        Bucket: params.bucket,
        Key: key,
        Body: params.bytes,
        ContentType: params.contentType,
      }),
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "S3 upload failed.";
    if (msg.includes("Cannot find module") || msg.includes("Cannot resolve")) {
      return {
        error:
          "S3 upload requires @aws-sdk/client-s3. Run npm install @aws-sdk/client-s3 or use Supabase Storage instead.",
      };
    }
    logger.error("S3 storefront upload failed", e);
    return { error: msg };
  }

  if (publicBase) {
    return { publicUrl: `${publicBase.replace(/\/$/, "")}/${key}` };
  }
  const endpoint = process.env.STOREFRONT_S3_ENDPOINT?.trim();
  if (endpoint) {
    return { publicUrl: `${endpoint.replace(/\/$/, "")}/${params.bucket}/${key}` };
  }
  return { publicUrl: `https://${params.bucket}.s3.${region}.amazonaws.com/${key}` };
}

export async function uploadStorefrontMediaAsset(params: {
  userId: string;
  storefrontId: string;
  fileName: string;
  contentType: string;
  bytes: Uint8Array;
  altText?: string;
  label?: string;
}): Promise<{ ok: true; assetId: string; url: string } | { ok: false; error: string }> {
  const gate = await assertStorefrontAssetUploadAllowed();
  if (!gate.ok) {
    void logUploadDenied({
      channel: "storefront_media",
      actorUserId: params.userId,
      entity: { type: "Storefront", id: params.storefrontId },
      mimeType: params.contentType,
      sizeBytes: params.bytes.byteLength,
      reason: gate.reason,
    });
    return { ok: false, error: gate.reason };
  }

  const validated = validateStorefrontMediaUpload({
    bytes: params.bytes,
    mimeType: params.contentType,
  });
  if (!validated.ok) {
    void logUploadDenied({
      channel: "storefront_media",
      actorUserId: params.userId,
      entity: { type: "Storefront", id: params.storefrontId },
      mimeType: params.contentType,
      sizeBytes: params.bytes.byteLength,
      reason: validated.error,
    });
    return { ok: false, error: validated.error };
  }

  const safe = await enforceUploadContentSafety({
    bytes: params.bytes,
    mimeType: validated.mimeType,
    channel: "storefront_media",
    actorUserId: params.userId,
    entity: { type: "Storefront", id: params.storefrontId },
  });
  if (!safe.ok) {
    return { ok: false, error: safe.error };
  }

  const provider = resolveConfiguredStorefrontStorageProvider();
  const bucket = storefrontBucketName() || process.env.STOREFRONT_S3_BUCKET?.trim();
  if (!bucket) {
    const error = "Storage bucket is not configured.";
    void logUploadDenied({
      channel: "storefront_media",
      actorUserId: params.userId,
      entity: { type: "Storefront", id: params.storefrontId },
      mimeType: validated.mimeType,
      sizeBytes: params.bytes.byteLength,
      reason: error,
    });
    return { ok: false, error };
  }

  const ext = params.fileName.split(".").pop()?.toLowerCase() || "bin";
  const path = `storefront/${params.storefrontId}/${randomUUID()}.${ext}`;

  const uploaded =
    provider === "S3_COMPATIBLE"
      ? await uploadToS3Compatible({
          bucket,
          path,
          bytes: params.bytes,
          contentType: validated.mimeType,
        })
      : await uploadToSupabase({
          bucket,
          path,
          bytes: params.bytes,
          contentType: validated.mimeType,
        });

  if ("error" in uploaded) {
    void logUploadDenied({
      channel: "storefront_media",
      actorUserId: params.userId,
      entity: { type: "Storefront", id: params.storefrontId },
      mimeType: validated.mimeType,
      sizeBytes: params.bytes.byteLength,
      reason: uploaded.error,
      metadata: { storageProvider: provider },
    });
    return { ok: false, error: uploaded.error };
  }

  const asset = await prisma.storefrontAsset.create({
    data: {
      userId: params.userId,
      storefrontId: params.storefrontId,
      url: uploaded.publicUrl,
      kind: "image",
      label: params.label?.trim() || params.fileName,
      storageProvider: provider,
      storageKey: path,
      mimeType: validated.mimeType,
      sizeBytes: params.bytes.byteLength,
      altText: params.altText?.trim() || null,
      createdByUserId: params.userId,
    },
  });

  void logUploadSucceeded({
    channel: "storefront_media",
    actorUserId: params.userId,
    entity: { type: "StorefrontAsset", id: asset.id, label: asset.label },
    mimeType: validated.mimeType,
    sizeBytes: params.bytes.byteLength,
    assetId: asset.id,
    publicUrl: uploaded.publicUrl,
    metadata: {
      storefrontId: params.storefrontId,
      storageProvider: provider,
      malwareScanEnabled: safe.scan.enabled,
      malwareScanLayer: safe.scan.enabled ? safe.scan.layer : null,
      malwareScanVerdict: safe.scan.enabled ? safe.scan.verdict : null,
    },
  });

  return { ok: true, assetId: asset.id, url: uploaded.publicUrl };
}

export async function deleteStorefrontMediaAsset(params: {
  userId: string;
  assetId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const row = await prisma.storefrontAsset.findFirst({
    where: { id: params.assetId, userId: params.userId },
  });
  if (!row) return { ok: false, error: "Asset not found." };
  await prisma.storefrontAsset.delete({ where: { id: row.id } });
  return { ok: true };
}

import { randomUUID } from "crypto";

import { createClient } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";
import { resolveConfiguredStorefrontStorageProvider } from "@/lib/storefront/storage-provider";
import { enforceStorefrontRateLimit } from "@/lib/storefront/storefront-rate-limit";
import { enforceUploadContentSafety } from "@/lib/upload-policy/enforce-upload-content-safety";
import {
  uploadMalwareScanStatusForApi,
  type UploadMalwareScanReceipt,
} from "@/lib/upload-policy/malware-scan";
import {
  storefrontFormAttachmentExtension,
  validateStorefrontFormAttachmentUpload,
} from "@/lib/upload-policy/media-upload-validation";
import { logUploadDenied, logUploadSucceeded } from "@/services/audit/upload-audit";

function bucketName(): string | null {
  return (
    process.env.STOREFRONT_SUPABASE_STORAGE_BUCKET?.trim() ||
    process.env.STOREFRONT_MEDIA_UPLOAD_BUCKET?.trim() ||
    process.env.STOREFRONT_S3_BUCKET?.trim() ||
    null
  );
}

export async function uploadStorefrontFormAttachment(input: {
  storeSlug: string;
  formId: string;
  fieldId: string;
  fileName: string;
  contentType: string;
  bytes: Uint8Array;
}): Promise<
  | {
      ok: true;
      url: string;
      fileName: string;
      contentType: string;
      sizeBytes: number;
      scanned: ReturnType<typeof uploadMalwareScanStatusForApi>;
      scan: UploadMalwareScanReceipt;
    }
  | { ok: false; error: string }
> {
  const rate = await enforceStorefrontRateLimit("storefront_contact_submit", {
    scopeSuffix: `${input.storeSlug}:${input.formId}`,
  });
  if (!rate.ok) {
    void logUploadDenied({
      channel: "storefront_form_attachment",
      entity: { type: "StorefrontForm", id: input.formId },
      mimeType: input.contentType,
      sizeBytes: input.bytes.byteLength,
      reason: rate.message,
      metadata: { storeSlug: input.storeSlug, fieldId: input.fieldId },
      source: "API",
    });
    return { ok: false, error: rate.message };
  }

  const validated = validateStorefrontFormAttachmentUpload({
    bytes: input.bytes,
    mimeType: input.contentType,
  });
  if (!validated.ok) {
    void logUploadDenied({
      channel: "storefront_form_attachment",
      entity: { type: "StorefrontForm", id: input.formId },
      mimeType: input.contentType,
      sizeBytes: input.bytes.byteLength,
      reason: validated.error,
      metadata: { storeSlug: input.storeSlug, fieldId: input.fieldId },
      source: "API",
    });
    return { ok: false, error: validated.error };
  }

  const safe = await enforceUploadContentSafety({
    bytes: input.bytes,
    mimeType: validated.mimeType,
    channel: "storefront_form_attachment",
    entity: { type: "StorefrontForm", id: input.formId },
    metadata: { storeSlug: input.storeSlug, fieldId: input.fieldId },
    source: "API",
  });
  if (!safe.ok) {
    return { ok: false, error: safe.error };
  }

  const bucket = bucketName();
  if (!bucket) {
    const error = "File storage is not configured.";
    void logUploadDenied({
      channel: "storefront_form_attachment",
      entity: { type: "StorefrontForm", id: input.formId },
      mimeType: validated.mimeType,
      sizeBytes: input.bytes.byteLength,
      reason: error,
      metadata: { storeSlug: input.storeSlug, fieldId: input.fieldId },
      source: "API",
    });
    return { ok: false, error };
  }

  const ext = storefrontFormAttachmentExtension(validated.mimeType);
  const path = `storefront-forms/${input.storeSlug}/${input.formId}/${input.fieldId}/${randomUUID()}.${ext}`;

  const url = await putObject({
    bucket,
    path,
    bytes: input.bytes,
    contentType: validated.mimeType,
  });
  if (!url) {
    void logUploadDenied({
      channel: "storefront_form_attachment",
      entity: { type: "StorefrontForm", id: input.formId },
      mimeType: validated.mimeType,
      sizeBytes: input.bytes.byteLength,
      reason: "Upload failed.",
      metadata: { storeSlug: input.storeSlug, fieldId: input.fieldId },
      source: "API",
    });
    return { ok: false, error: "Upload failed." };
  }

  void logUploadSucceeded({
    channel: "storefront_form_attachment",
    entity: { type: "StorefrontForm", id: input.formId },
    mimeType: validated.mimeType,
    sizeBytes: input.bytes.byteLength,
    publicUrl: url,
    metadata: {
      storeSlug: input.storeSlug,
      fieldId: input.fieldId,
      malwareScanEnabled: safe.scan.enabled,
      malwareScanLayer: safe.scan.enabled ? safe.scan.layer : null,
      malwareScanVerdict: safe.scan.enabled ? safe.scan.verdict : null,
    },
    source: "API",
  });

  return {
    ok: true,
    url,
    fileName: input.fileName,
    contentType: validated.mimeType,
    sizeBytes: input.bytes.byteLength,
    scanned: uploadMalwareScanStatusForApi(safe.scan),
    scan: safe.scan,
  };
}

async function putObject(params: {
  bucket: string;
  path: string;
  bytes: Uint8Array;
  contentType: string;
}): Promise<string | null> {
  const provider = resolveConfiguredStorefrontStorageProvider();
  if (provider === "S3_COMPATIBLE") {
    const region = process.env.STOREFRONT_S3_REGION?.trim();
    const accessKey = process.env.STOREFRONT_S3_ACCESS_KEY_ID?.trim();
    const secretKey = process.env.STOREFRONT_S3_SECRET_ACCESS_KEY?.trim();
    const publicBase = process.env.STOREFRONT_S3_PUBLIC_BASE_URL?.trim();
    if (!region || !accessKey || !secretKey) return null;
    try {
      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
      const client = new S3Client({
        region,
        credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
        ...(process.env.STOREFRONT_S3_ENDPOINT?.trim()
          ? { endpoint: process.env.STOREFRONT_S3_ENDPOINT.trim(), forcePathStyle: true }
          : {}),
      });
      const key = params.path.replace(/^\//, "");
      await client.send(
        new PutObjectCommand({
          Bucket: params.bucket,
          Key: key,
          Body: params.bytes,
          ContentType: params.contentType,
        }),
      );
      if (publicBase) return `${publicBase.replace(/\/$/, "")}/${key}`;
      const endpoint = process.env.STOREFRONT_S3_ENDPOINT?.trim();
      if (endpoint) return `${endpoint.replace(/\/$/, "")}/${params.bucket}/${key}`;
      return `https://${params.bucket}.s3.${region}.amazonaws.com/${key}`;
    } catch (e) {
      logger.error("Form S3 upload failed", e);
      return null;
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.storage.from(params.bucket).upload(params.path, params.bytes, {
    contentType: params.contentType,
    upsert: false,
  });
  if (error) {
    logger.error("Form Supabase upload failed", error);
    return null;
  }
  return supabase.storage.from(params.bucket).getPublicUrl(params.path).data.publicUrl;
}

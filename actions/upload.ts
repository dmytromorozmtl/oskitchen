"use server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import type { UploadBucket } from "@/lib/storage";
import { uploadKitchenAsset } from "@/lib/storage";
import {
  kitchenRasterImageExtension,
  validateKitchenRasterImageUpload,
} from "@/lib/upload-policy/media-upload-validation";

async function uploadKitchenImageFromFile(params: {
  bucket: UploadBucket;
  buildPath: (ext: ReturnType<typeof kitchenRasterImageExtension>) => string;
  file: File;
}): Promise<{ publicUrl: string } | { error: string }> {
  const bytes = new Uint8Array(await params.file.arrayBuffer());
  const validated = validateKitchenRasterImageUpload({
    bytes,
    mimeType: params.file.type || "",
  });
  if (!validated.ok) {
    return { error: validated.error };
  }

  const ext = kitchenRasterImageExtension(validated.mimeType);
  return uploadKitchenAsset({
    bucket: params.bucket,
    path: params.buildPath(ext),
    bytes,
    contentType: validated.mimeType,
  });
}

export async function uploadProductImageAction(formData: FormData) {
  const { sessionUser: user } = await requireTenantActor();
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Missing file" };

  const result = await uploadKitchenImageFromFile({
    bucket: "product-images",
    buildPath: (ext) => `${user.id}/${crypto.randomUUID()}.${ext}`,
    file,
  });

  if ("error" in result) return { error: result.error };
  return { publicUrl: result.publicUrl };
}

export async function uploadBusinessLogoAction(formData: FormData) {
  const { sessionUser: user } = await requireTenantActor();
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Missing file" };

  const result = await uploadKitchenImageFromFile({
    bucket: "business-logos",
    buildPath: (ext) => `${user.id}/logo.${ext}`,
    file,
  });

  if ("error" in result) return { error: result.error };
  return { publicUrl: result.publicUrl };
}

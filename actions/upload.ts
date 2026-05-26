"use server";


import { fail, ok } from "@/lib/action-result";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import type { UploadBucket } from "@/lib/storage";
import { uploadKitchenAsset } from "@/lib/storage";

export async function uploadProductImageAction(formData: FormData) {
  const { sessionUser: user, dataUserId } = await requireTenantActor();
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Missing file" };

  const buf = new Uint8Array(await file.arrayBuffer());
  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/gif"
          ? "gif"
          : "jpg";

  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const result = await uploadKitchenAsset({
    bucket: "product-images",
    path,
    bytes: buf,
    contentType: file.type || "image/jpeg",
  });

  if ("error" in result) return { error: result.error };
  return { publicUrl: result.publicUrl };
}

export async function uploadBusinessLogoAction(formData: FormData) {
  const { sessionUser: user, dataUserId } = await requireTenantActor();
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Missing file" };

  const buf = new Uint8Array(await file.arrayBuffer());
  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `${user.id}/logo.${ext}`;
  const result = await uploadKitchenAsset({
    bucket: "business-logos",
    path,
    bytes: buf,
    contentType: file.type || "image/jpeg",
  });

  if ("error" in result) return { error: result.error };
  return { publicUrl: result.publicUrl };
}

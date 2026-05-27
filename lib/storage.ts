import { createClient } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";
import { validateKitchenRasterImageUpload } from "@/lib/upload-policy/media-upload-validation";

export type UploadBucket = "product-images" | "business-logos";

export async function uploadKitchenAsset(params: {
  bucket: UploadBucket;
  path: string;
  bytes: Uint8Array;
  contentType: string;
}): Promise<{ publicUrl: string } | { error: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return {
      error:
        "Supabase Storage requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.",
    };
  }

  const validated = validateKitchenRasterImageUpload({
    bytes: params.bytes,
    mimeType: params.contentType,
  });
  if (!validated.ok) {
    return { error: validated.error };
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.storage
    .from(params.bucket)
    .upload(params.path, params.bytes, {
      contentType: validated.mimeType,
      upsert: true,
    });

  if (error) {
    logger.error("Supabase upload failed", error);
    return { error: error.message };
  }

  const { data } = supabase.storage.from(params.bucket).getPublicUrl(params.path);
  return { publicUrl: data.publicUrl };
}

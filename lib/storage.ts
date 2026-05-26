import { createClient } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

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

  if (!ALLOWED.has(params.contentType)) {
    return { error: "Only JPEG, PNG, WebP, or GIF images are allowed." };
  }

  if (params.bytes.byteLength > MAX_BYTES) {
    return { error: "File too large (max 4MB)." };
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.storage
    .from(params.bucket)
    .upload(params.path, params.bytes, {
      contentType: params.contentType,
      upsert: true,
    });

  if (error) {
    logger.error("Supabase upload failed", error);
    return { error: error.message };
  }

  const { data } = supabase.storage.from(params.bucket).getPublicUrl(params.path);
  return { publicUrl: data.publicUrl };
}

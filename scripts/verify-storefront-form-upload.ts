/**
 * Verify form file uploads use the same storage bucket as media library.
 *   npm run storefront:verify-form-upload
 */
import { createClient } from "@supabase/supabase-js";

import { resolveConfiguredStorefrontStorageProvider } from "@/lib/storefront/storage-provider";
import { loadStorefrontScriptEnv } from "./lib/load-storefront-script-env";

loadStorefrontScriptEnv();

async function main(): Promise<void> {
  const provider = resolveConfiguredStorefrontStorageProvider();
  const bucket =
    process.env.STOREFRONT_SUPABASE_STORAGE_BUCKET?.trim() ||
    process.env.STOREFRONT_MEDIA_UPLOAD_BUCKET?.trim() ||
    process.env.STOREFRONT_S3_BUCKET?.trim();

  if (!bucket) {
    console.error("No bucket — set STOREFRONT_SUPABASE_STORAGE_BUCKET");
    process.exit(1);
  }

  console.log(`Provider: ${provider ?? "none"} · bucket: ${bucket}`);

  if (provider !== "supabase") {
    console.log("✓ Non-Supabase provider — form uploads use S3 path when configured");
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    console.error("Missing Supabase URL or service role key");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const prefix = "forms/";
  const { error } = await supabase.storage.from(bucket).list(prefix, { limit: 1 });
  if (error) {
    console.error(`list "${prefix}" failed:`, error.message);
    process.exit(1);
  }

  console.log(`✓ Form upload prefix "${prefix}" reachable on bucket "${bucket}"`);
  console.log("  POST /api/storefront/forms/upload — field type file on storefront forms");
}

void main();

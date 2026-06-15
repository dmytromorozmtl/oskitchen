/**
 * Verify storefront media bucket is reachable (list + optional public URL probe).
 *   npm run storefront:verify-media-bucket
 */
import { createClient } from "@supabase/supabase-js";

import { isStorefrontMediaUploadConfigured } from "@/lib/storefront-builder/media-config";
import { loadStorefrontScriptEnv } from "./lib/load-storefront-script-env";

async function main(): Promise<void> {
  loadStorefrontScriptEnv();
  if (!isStorefrontMediaUploadConfigured()) {
    console.error("Media bucket not configured — set STOREFRONT_SUPABASE_STORAGE_BUCKET in env");
    process.exit(1);
  }

  const bucket =
    process.env.STOREFRONT_SUPABASE_STORAGE_BUCKET?.trim() ||
    process.env.STOREFRONT_MEDIA_UPLOAD_BUCKET?.trim()!;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    console.error("Missing Supabase URL or service role key");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error("listBuckets failed:", error.message);
    process.exit(1);
  }

  const row = buckets?.find((b) => b.name === bucket);
  if (!row) {
    console.error(`Bucket "${bucket}" not found — run: npm run storefront:setup-media-bucket`);
    process.exit(1);
  }

  console.log(`✓ Bucket "${bucket}" exists (public: ${row.public ?? "unknown"})`);

  const { data: files, error: listErr } = await supabase.storage.from(bucket).list("", { limit: 5 });
  if (listErr) {
    console.error("list objects failed:", listErr.message);
    process.exit(1);
  }

  console.log(`✓ List OK (${files?.length ?? 0} object(s) at root prefix)`);
  console.log("\nPilot: upload via /dashboard/storefront/media and use URL in Builder → Slider.");
}

void main();

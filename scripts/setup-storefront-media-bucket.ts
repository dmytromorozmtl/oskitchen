/**
 * Create Supabase Storage bucket for storefront media (idempotent).
 *   npm run storefront:setup-media-bucket
 *
 * Loads env via dotenv parser; patches .env.production.local with bucket name.
 */
import { join } from "node:path";

import { createClient } from "@supabase/supabase-js";

import { loadStorefrontScriptEnv } from "./lib/load-storefront-script-env";
import { patchEnvFile } from "./lib/patch-env-file";

const DEFAULT_BUCKET = "storefront-media";
const ROOT = process.cwd();

async function main(): Promise<void> {
  const loaded = loadStorefrontScriptEnv();
  if (loaded.length) console.log(`Env: ${loaded.join(", ")}\n`);
  const bucket =
    process.env.STOREFRONT_SUPABASE_STORAGE_BUCKET?.trim() ||
    process.env.STOREFRONT_MEDIA_UPLOAD_BUCKET?.trim() ||
    DEFAULT_BUCKET;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error("listBuckets:", listErr.message);
    process.exit(1);
  }

  const exists = buckets?.some((b) => b.name === bucket);
  if (exists) {
    console.log(`✓ Bucket "${bucket}" already exists`);
  } else {
    const { error: createErr } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 8 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
    });
    if (createErr) {
      console.error("createBucket:", createErr.message);
      process.exit(1);
    }
    console.log(`✓ Created public bucket "${bucket}" (8MB, image MIME allowlist)`);
  }

  const prodEnv = join(ROOT, ".env.production.local");
  patchEnvFile(prodEnv, "STOREFRONT_SUPABASE_STORAGE_BUCKET", bucket);
  console.log(`✓ Patched ${prodEnv} → STOREFRONT_SUPABASE_STORAGE_BUCKET=${bucket}`);

  console.log("\nNext:");
  console.log(`  1. Vercel Production: STOREFRONT_SUPABASE_STORAGE_BUCKET=${bucket}`);
  console.log("  2. Redeploy");
  console.log("  3. Admin → /dashboard/storefront/media → upload test image");
  console.log("  4. npm run storefront:verify-media-bucket");
  console.log("  5. npm run storefront:week2-complete");
}

void main();

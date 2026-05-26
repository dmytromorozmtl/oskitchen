/**
 * Create Supabase Storage buckets for kitchen asset uploads (idempotent).
 *   npm run kitchen:setup-asset-buckets
 *
 * Buckets: product-images, business-logos (used by lib/storage.ts)
 */
import { createClient } from "@supabase/supabase-js";

import { loadProductionEnvLocal } from "./lib/load-dotenv-file";

const KITCHEN_BUCKETS = ["product-images", "business-logos"] as const;

async function ensureBucket(
  supabase: ReturnType<typeof createClient>,
  name: string,
): Promise<void> {
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) throw new Error(`listBuckets: ${listErr.message}`);

  if (buckets?.some((b) => b.name === name)) {
    console.log(`✓ Bucket "${name}" already exists`);
    return;
  }

  const { error: createErr } = await supabase.storage.createBucket(name, {
    public: true,
    fileSizeLimit: 4 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  });
  if (createErr) throw new Error(`createBucket(${name}): ${createErr.message}`);
  console.log(`✓ Created public bucket "${name}"`);
}

async function main(): Promise<void> {
  const loaded = loadProductionEnvLocal();
  if (loaded.length) console.log(`Env: ${loaded.join(", ")}\n`);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const bucket of KITCHEN_BUCKETS) {
    await ensureBucket(supabase, bucket);
  }

  console.log("\nDone. Avatar uploads use business-logos/avatars/{userId}.*");
}

void main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

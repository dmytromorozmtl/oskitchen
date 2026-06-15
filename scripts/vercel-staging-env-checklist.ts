/**
 * Vercel staging env copy checklist (step 3) — no secrets printed.
 *
 *   npm run vercel:staging-checklist
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const KEYS = [
  "NODE_ENV",
  "NEXT_PUBLIC_APP_ENV",
  "NEXT_PUBLIC_APP_URL",
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ENCRYPTION_KEY",
  "CRON_SECRET",
  "RATE_LIMIT_ADAPTER",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "PLATFORM_IMPERSONATION_TOTP_SECRET",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
] as const;

function main() {
  const examplePath = join(process.cwd(), ".env.staging.example");
  let exampleKeys = new Set<string>();
  try {
    for (const line of readFileSync(examplePath, "utf8").split("\n")) {
      const m = line.match(/^([A-Z][A-Z0-9_]*)=/);
      if (m?.[1]) exampleKeys.add(m[1]);
    }
  } catch {
    exampleKeys = new Set(KEYS);
  }

  console.log("=== Vercel Staging Environment Checklist ===\n");
  console.log("Project → Settings → Environment Variables → Staging\n");

  let set = 0;
  let missing = 0;
  for (const key of KEYS) {
    const has = Boolean(process.env[key]?.trim());
    if (has) set++;
    else missing++;
    const inExample = exampleKeys.has(key) ? "" : " (optional)";
    console.log(`${has ? "[x]" : "[ ]"} ${key}${inExample}`);
  }

  console.log(`\nLocal shell: ${set}/${KEYS.length} set (compare before Vercel paste).`);
  console.log("After deploy: npm run verify:staging-env -- --strict");
  console.log("TOTP: npm run setup:impersonation-totp");
}

main();

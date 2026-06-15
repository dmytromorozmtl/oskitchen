/**
 * Merge DB + Supabase + pilot secrets from .env.local → .env.staging.local (safe patch).
 *
 *   npm run staging:env:sync-local
 */
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { parseDotenv } from "./lib/load-dotenv-file";
import { patchEnvFile } from "./lib/patch-env-file";

const ROOT = process.cwd();
const LOCAL = join(ROOT, ".env.local");
const STAGING = join(ROOT, ".env.staging.local");
const EXAMPLE = join(ROOT, ".env.staging.example");

const FROM_LOCAL = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
] as const;

function isPlaceholder(val: string): boolean {
  return (
    !val.trim() ||
    val.includes("aws-REGION") ||
    val.includes("yourdomain.com") ||
    val.includes("PROJECT") ||
    val.includes("PASSWORD@")
  );
}

function main(): void {
  if (!existsSync(LOCAL)) {
    console.error("Missing .env.local");
    process.exit(1);
  }
  if (!existsSync(STAGING)) {
    copyFileSync(EXAMPLE, STAGING);
    console.log(`Created ${STAGING} from example`);
  }

  const local = parseDotenv(readFileSync(LOCAL, "utf8"));
  console.log("Syncing from .env.local → .env.staging.local\n");

  for (const key of FROM_LOCAL) {
    const val = local[key]?.trim();
    if (!val || isPlaceholder(val)) continue;
    patchEnvFile(STAGING, key, val);
    console.log(`  synced ${key}`);
  }

  const stagingUrl = process.env.STAGING_APP_URL?.trim();
  if (stagingUrl && !isPlaceholder(stagingUrl)) {
    patchEnvFile(STAGING, "NEXT_PUBLIC_APP_URL", stagingUrl.replace(/\/$/, ""));
    console.log("  set NEXT_PUBLIC_APP_URL from STAGING_APP_URL");
  }

  console.log("\nNext:");
  console.log("  npm run staging:secrets:generate");
  console.log("  Add UPSTASH_* + run: npm run setup:impersonation-totp");
  console.log("  npm run vercel:staging-push -- --dry-run");
}

main();

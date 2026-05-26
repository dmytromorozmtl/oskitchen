/**
 * Copy DB/Supabase keys from .env.local → .env.production.local (safe parser, no sed).
 *   npm run storefront:env:sync-local
 */
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { parseDotenv } from "./lib/load-dotenv-file";
import { patchEnvFile } from "./lib/patch-env-file";

const ROOT = process.cwd();
const LOCAL = join(ROOT, ".env.local");
const PROD = join(ROOT, ".env.production.local");
const EXAMPLE = join(ROOT, ".env.storefront.production.example");

const KEYS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CRON_SECRET",
] as const;

function main(): void {
  if (!existsSync(LOCAL)) {
    console.error("Missing .env.local");
    process.exit(1);
  }
  if (!existsSync(PROD)) {
    copyFileSync(EXAMPLE, PROD);
  }

  const local = parseDotenv(readFileSync(LOCAL, "utf8"));
  console.log("Syncing from .env.local → .env.production.local (safe patch)\n");

  for (const key of KEYS) {
    const val = local[key]?.trim();
    if (!val) continue;
    patchEnvFile(PROD, key, val);
    console.log(`  synced ${key}`);
  }

  const prodUrl = process.env.STOREFRONT_PROD_APP_URL?.trim();
  if (prodUrl) {
    patchEnvFile(PROD, "NEXT_PUBLIC_APP_URL", prodUrl.replace(/\/$/, ""));
    console.log("  set NEXT_PUBLIC_APP_URL from STOREFRONT_PROD_APP_URL");
  } else {
    console.log("\nTip: set NEXT_PUBLIC_APP_URL or STOREFRONT_PROD_APP_URL for production host.");
  }
}

main();

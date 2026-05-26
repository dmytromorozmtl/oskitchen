/**
 * Print allowlisted secrets from .env.production.local for `dev:safe` only.
 * Never exports DATABASE_URL / DIRECT_URL (use .env.local pooler URL).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { parseDotenv } from "./lib/load-dotenv-file";

const ALLOW = new Set([
  "AUTH_SECRET",
  "STOREFRONT_PREVIEW_SECRET",
  "STOREFRONT_MIDDLEWARE_SECRET",
  "STOREFRONT_CART_SECRET",
  "CRON_SECRET",
  "TURNSTILE_SECRET_KEY",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
]);

const path = join(process.cwd(), ".env.production.local");
if (!existsSync(path)) process.exit(0);

const parsed = parseDotenv(readFileSync(path, "utf8"));
for (const key of ALLOW) {
  const val = parsed[key]?.trim();
  if (!val) continue;
  const escaped = val.replace(/'/g, `'\\''`);
  console.log(`export ${key}='${escaped}'`);
}

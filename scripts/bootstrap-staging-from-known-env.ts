/**
 * Pull staging URL (and optional Upstash) from other gitignored env files in the repo.
 *
 *   npm run staging:bootstrap-known-env
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { parseDotenv } from "./lib/load-dotenv-file";
import { patchEnvFile } from "./lib/patch-env-file";
import {
  isPlaceholderEnvValue,
  isValidUpstashToken,
  isValidUpstashUrl,
} from "./lib/staging-env-placeholders";

const ROOT = process.cwd();
const TARGET = join(ROOT, ".env.staging.local");
const SOURCES = [
  ".env.storefront.week1.example",
  ".env.storefront.staging.local",
  ".env.production.local",
  ".env.beta.local",
  ".env.local",
];

function findVercelUrl(): string | undefined {
  const preferKeys = [
    "STAGING_APP_URL",
    "NEXT_PUBLIC_APP_URL",
    "SMOKE_BASE_URL",
    "PLAYWRIGHT_BASE_URL",
    "STOREFRONT_SMOKE_BASE_URL",
    "LHCI_BASE_URL",
    "E2E_STAGING_BASE_URL",
  ];
  const candidates: string[] = [];

  for (const rel of SOURCES) {
    const p = join(ROOT, rel);
    if (!existsSync(p)) continue;
    const env = parseDotenv(readFileSync(p, "utf8"));
    for (const key of preferKeys) {
      const v = env[key]?.trim();
      if (v?.includes(".vercel.app") && !isPlaceholderEnvValue(v)) {
        candidates.push(v.replace(/\/$/, ""));
      }
    }
    for (const v of Object.values(env)) {
      if (v.includes(".vercel.app") && !isPlaceholderEnvValue(v)) {
        candidates.push(v.replace(/\/$/, ""));
      }
    }
  }

  const staging = candidates.find((u) => u.includes("preview--staging") || u.includes("staging"));
  return staging ?? candidates[0];
}

function main() {
  if (!existsSync(TARGET)) {
    console.error("Missing .env.staging.local — run: npm run staging:secrets:generate");
    process.exit(1);
  }

  let changed = 0;

  const url = findVercelUrl();
  const env = (() => {
    const merged: Record<string, string> = {};
    for (const rel of SOURCES) {
      const p = join(ROOT, rel);
      if (!existsSync(p)) continue;
      Object.assign(merged, parseDotenv(readFileSync(p, "utf8")));
    }
    return merged;
  })();
  if (url) {
    patchEnvFile(TARGET, "NEXT_PUBLIC_APP_URL", url);
    console.log(`  + NEXT_PUBLIC_APP_URL from known env (${url})`);
    changed++;
  }

  const upstashUrl = env.UPSTASH_REDIS_REST_URL?.trim();
  const upstashToken = env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (isValidUpstashUrl(upstashUrl) && isValidUpstashToken(upstashToken)) {
    patchEnvFile(TARGET, "UPSTASH_REDIS_REST_URL", upstashUrl!);
    patchEnvFile(TARGET, "UPSTASH_REDIS_REST_TOKEN", upstashToken!);
    patchEnvFile(TARGET, "RATE_LIMIT_ADAPTER", "upstash");
    console.log("  + UPSTASH_* from known env");
    changed++;
  }

  console.log(`\nBootstrap complete (${changed} field(s) updated).`);
  if (!url) {
    console.log("No .vercel.app URL found in local env files.");
    console.log("Set: export STAGING_APP_URL=https://your-preview.vercel.app");
  }
  if (!isValidUpstashUrl(upstashUrl) || !isValidUpstashToken(upstashToken)) {
    console.log("Upstash still missing → docs/UPSTASH_STAGING_SETUP.md");
  }
  console.log("\nRun: npm run staging:ops:status && npm run pilot:next-step");
}

main();

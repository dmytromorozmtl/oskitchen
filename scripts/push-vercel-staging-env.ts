/**
 * Push staging env vars to Vercel (staging target).
 *
 *   npm run vercel:staging-push -- --dry-run     # print keys only
 *   npm run vercel:staging-push -- --apply       # vercel env add (interactive confirm per key)
 *
 * Requires: vercel CLI linked (`vercel link`), .env.staging.local + .env.local loaded.
 */
import { execSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { loadEnvFiles } from "./lib/load-dotenv-file";

const KEYS = [
  "NEXT_PUBLIC_APP_ENV",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_NAV_RELEASE_PROFILE",
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
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_DSN",
  "SENTRY_TRACES_SAMPLE_RATE",
  "NODE_OPTIONS",
] as const;

function hasVercelCli(): boolean {
  try {
    execSync("vercel --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function main() {
  const dryRun = process.argv.includes("--dry-run");
  const apply = process.argv.includes("--apply");
  const production = process.argv.includes("--production");
  const vercelTarget = production ? "production" : "staging";

  loadEnvFiles([".env", ".env.staging.local", ".env.local"]);

  if (production) {
    process.env.NEXT_PUBLIC_APP_URL =
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      "https://kitchen-hnyz5eapr-aervio.vercel.app";
    process.env.NEXT_PUBLIC_NAV_RELEASE_PROFILE =
      process.env.NEXT_PUBLIC_NAV_RELEASE_PROFILE?.trim() || "pilot";
    process.env.NODE_OPTIONS = process.env.NODE_OPTIONS?.trim() || "--max-old-space-size=8192";
  }

  if (!existsSync(join(process.cwd(), ".env.staging.local"))) {
    console.error("Missing .env.staging.local — run: npm run staging:env:sync-local && npm run staging:secrets:generate");
    process.exit(1);
  }

  console.log(`=== Vercel ${vercelTarget} environment push ===\n`);
  console.log(`Target: Vercel → Project → Settings → Environment → **${vercelTarget}**\n`);

  const missing: string[] = [];
  const ready: string[] = [];

  for (const key of KEYS) {
    const val = process.env[key]?.trim();
    if (!val) missing.push(key);
    else ready.push(key);
  }

  for (const key of ready) {
    console.log(`[ready] ${key}`);
  }
  for (const key of missing) {
    console.log(`[MISSING] ${key}`);
  }

  if (missing.length > 0) {
    console.log("\nFill missing keys in .env.staging.local / .env.local before push.");
    if (missing.includes("UPSTASH_REDIS_REST_TOKEN")) {
      console.log("  Upstash: https://console.upstash.com → REST API → copy URL + token");
    }
    if (missing.includes("PLATFORM_IMPERSONATION_TOTP_SECRET")) {
      console.log("  TOTP: npm run setup:impersonation-totp");
    }
  }

  if (dryRun || !apply) {
    console.log("\nDry-run / manual paste:");
    console.log(`  Vercel Dashboard → Settings → Environment Variables → ${vercelTarget}`);
    console.log(`  Or: npm run vercel:staging-push -- --apply${production ? " --production" : ""}`);
    process.exit(dryRun && missing.length > 0 ? 1 : 0);
  }

  if (ready.length === 0) {
    console.error("\nNo env keys ready to push.");
    process.exit(1);
  }

  if (missing.length > 0) {
    console.log(`\nWARN Pushing ${ready.length} ready keys; ${missing.length} missing (add later in Dashboard).`);
  }

  if (!hasVercelCli()) {
    console.error("\nvercel CLI not found. Install: npm i -g vercel");
    process.exit(1);
  }

  console.log(`\nApplying via \`vercel env add\` (${vercelTarget})…\n`);

  for (const key of ready) {
    const val = process.env[key]!;
    const useStdin = val.startsWith("-") || val.includes("\n");
    const res = spawnSync(
      "vercel",
      useStdin
        ? ["env", "add", key, vercelTarget, "--yes", "--force"]
        : ["env", "add", key, vercelTarget, "--yes", "--force", "--value", val],
      {
        input: useStdin ? val : undefined,
        stdio: useStdin ? ["pipe", "inherit", "inherit"] : ["pipe", "inherit", "inherit"],
        encoding: "utf8",
      },
    );
    if (res.status !== 0) {
      console.error(`Failed: ${key}`);
      process.exit(1);
    }
    console.log(`  pushed ${key}`);
  }

  console.log("\nDone. Redeploy staging, then:");
  console.log("  npm run verify:staging-env");
  console.log("  SMOKE_BASE_URL=$NEXT_PUBLIC_APP_URL npm run smoke:golden-path-http");
}

main();

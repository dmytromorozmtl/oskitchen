/**
 * Generate Vercel upload checklist from .env.production.local (names + SET/MISSING only).
 *   npm run storefront:vercel-manifest
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { STOREFRONT_DEPLOY_URLS } from "@/lib/storefront/storefront-deploy-urls";
import { parseDotenv } from "./lib/load-dotenv-file";

const ROOT = process.cwd();
const EXAMPLE = join(ROOT, ".env.storefront.production.example");
const PROD = join(ROOT, ".env.production.local");
const OUT = join(ROOT, "docs", "artifacts", "VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md");

const P0_REQUIRED = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_APP_URL",
  "STOREFRONT_MIDDLEWARE_SECRET",
  "CRON_SECRET",
  "AUTH_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const P0_OPTIONAL_EMAIL = ["RESEND_API_KEY", "RESEND_FROM_EMAIL"] as const;

const WEEK1_KEYS = [
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "STOREFRONT_REDIRECTS_ENABLED",
] as const;

const PHASE_C_KEYS = [
  "STOREFRONT_SUPABASE_STORAGE_BUCKET",
  "STOREFRONT_S3_BUCKET",
  "STOREFRONT_S3_REGION",
  "STOREFRONT_S3_ACCESS_KEY_ID",
  "STOREFRONT_S3_SECRET_ACCESS_KEY",
  "STOREFRONT_S3_PUBLIC_BASE_URL",
] as const;

const STRIPE_KEYS = new Set([
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STOREFRONT_STRIPE_CURRENCY",
]);

function isSet(val: string | undefined, key?: string): boolean {
  const v = val?.trim() ?? "";
  if (!v) return false;
  if (key === "NEXT_PUBLIC_APP_URL" && /yourdomain\.com/i.test(v)) return false;
  return true;
}

function main(): void {
  if (!existsSync(EXAMPLE)) {
    console.error("Missing .env.storefront.production.example");
    process.exit(1);
  }
  const prod = existsSync(PROD) ? parseDotenv(readFileSync(PROD, "utf8")) : {};

  const date = new Date().toISOString().slice(0, 10);

  function row(key: string, tier: string) {
    const set = isSet(prod[key], key);
    return { key, tier, local: set ? "SET" : "MISSING", upload: "☐" as const };
  }

  const p0RequiredRows = P0_REQUIRED.map((k) => row(k, "P0 required"));
  const p0EmailRows = P0_OPTIONAL_EMAIL.map((k) => row(k, "P0 email (optional)"));
  const week1Rows = WEEK1_KEYS.map((k) => row(k, "Week 1"));
  const phaseCRows = PHASE_C_KEYS.map((k) => row(k, "Phase C"));

  const p0Ready = p0RequiredRows.filter((r) => r.local === "SET").length;
  const appUrl = prod.NEXT_PUBLIC_APP_URL?.trim() ?? "";
  const appUrlOk = isSet(appUrl, "NEXT_PUBLIC_APP_URL");

  const md = [
    "# Vercel Production — upload checklist",
    "",
    `**Generated:** ${date} (local manifest — no secret values)`,
    `**Source:** \`.env.production.local\` vs \`.env.storefront.production.example\``,
    "",
    "## Summary",
    "",
    `| Metric | Value |`,
    `|--------|-------|`,
    `| P0 required ready | ${p0Ready}/${P0_REQUIRED.length} |`,
    `| \`NEXT_PUBLIC_APP_URL\` | ${appUrlOk ? `ready (\`${appUrl.replace(/\/$/, "")}\`)` : "⚠ set real prod URL (not placeholder)"} |`,
    `| Stripe Option A | Do **not** upload Stripe keys |`,
    "",
    "Copy each **SET** row into **Vercel → Project → Settings → Environment Variables → Production**, then redeploy.",
    "",
    "## Vercel UI — step by step",
    "",
    "1. Open [Vercel Dashboard](https://vercel.com) → your OS Kitchen project.",
    "2. **Settings → Environment Variables**.",
    "3. For each row below with **✓ SET** locally: **Add** → name = variable → value from 1Password / `.env.production.local` → Environment = **Production** only (unless noted).",
    "4. **Deployments → … → Redeploy** Production (required after any env change).",
    "5. Run post-deploy smoke (see bottom).",
    "",
    "### Staging / Preview (separate scope)",
    "",
    "Use **Preview** environment for staging smoke and crons:",
    "",
    `- \`STAGING_BASE_URL\` = \`${STOREFRONT_DEPLOY_URLS.staging}\` (or your preview host)`,
    "- Same DB/Supabase keys as production if sharing pilot data",
    "- `CRON_SECRET` must match Vercel cron Authorization header",
    "",
    "### Production canonical URL",
    "",
    appUrlOk
      ? `- \`NEXT_PUBLIC_APP_URL\` should be \`${appUrl.replace(/\/$/, "")}\` (matches local file)`
      : `- Set \`NEXT_PUBLIC_APP_URL\` to \`${STOREFRONT_DEPLOY_URLS.production}\` or your custom domain`,
    "",
    "## P0 — production release",
    "",
    "| Variable | Local | Upload to Vercel | Notes |",
    "|----------|-------|------------------|-------|",
    ...p0RequiredRows.map(
      (r) =>
        `| \`${r.key}\` | ${r.local === "SET" ? "✓ SET" : "✗ MISSING"} | ${r.upload} | |`,
    ),
    "",
    "## P0 — email (optional)",
    "",
    "| Variable | Local | Upload |",
    "|----------|-------|--------|",
    ...p0EmailRows.map((r) => `| \`${r.key}\` | ${r.local === "SET" ? "✓" : "—"} | ${r.upload} |`),
    "",
    "## Week 1 (after stable prod)",
    "",
    "| Variable | Local | Upload |",
    "|----------|-------|--------|",
    ...week1Rows.map((r) => `| \`${r.key}\` | ${r.local === "SET" ? "✓" : "—"} | ${r.upload} |`),
    "",
    "## Phase C — media pilot",
    "",
    "| Variable | Local | Upload |",
    "|----------|-------|--------|",
    ...phaseCRows.map((r) => `| \`${r.key}\` | ${r.local === "SET" ? "✓" : "—"} | ${r.upload} |`),
    "",
    "## Option B — skip for this release",
    "",
    "Do not set: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`",
    "",
    "## Verification column (manual)",
    "",
    "After pasting into Vercel, mark **Verified** in your copy or PR description:",
    "",
    "| Variable | Verified in Vercel Production |",
    "|----------|------------------------------|",
    ...p0RequiredRows.map((r) => `| \`${r.key}\` | ☐ |`),
    "",
    "## After upload",
    "",
    "```bash",
    "npm run storefront:apply-deploy-urls",
    "npm run storefront:vercel-manifest",
    "npm run storefront:release-status",
    "",
    "export STOREFRONT_SMOKE_BASE_URL=\"" + STOREFRONT_DEPLOY_URLS.production + "\"",
    "export STOREFRONT_SMOKE_SLUG=hello",
    "export STOREFRONT_SMOKE_ENV=production",
    "npm run storefront:post-deploy",
    "```",
    "",
    "Regenerate: `npm run storefront:vercel-manifest`",
    "",
  ].join("\n");

  writeFileSync(OUT, md, "utf8");
  console.log(`Wrote ${OUT}`);
  console.log(`P0 required ready: ${p0Ready}/${P0_REQUIRED.length}`);
  if (!appUrlOk) {
    console.warn("NEXT_PUBLIC_APP_URL is placeholder — set real prod URL before Vercel upload.");
    process.exitCode = 1;
  }
}

main();

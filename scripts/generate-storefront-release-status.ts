/**
 * Single-page release readiness dashboard (no secrets).
 *   npm run storefront:release-status
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { STOREFRONT_DEPLOY_URLS } from "@/lib/storefront/storefront-deploy-urls";
import {
  evaluateStorefrontReleaseEnv,
  storefrontReleaseEnvSummary,
} from "@/lib/storefront/storefront-release-env";
import { loadProductionEnvLocal, parseDotenv } from "./lib/load-dotenv-file";

const ROOT = process.cwd();
const OUT = join(ROOT, "docs", "artifacts", "STOREFRONT_RELEASE_CLOSURE_STATUS.md");

function readMdPass(path: string, pattern: RegExp): boolean | null {
  if (!existsSync(path)) return null;
  return pattern.test(readFileSync(path, "utf8"));
}

function main(): void {
  const date = new Date().toISOString().slice(0, 10);
  const prodEnv = join(ROOT, ".env.production.local");
  const prod = existsSync(prodEnv) ? parseDotenv(readFileSync(prodEnv, "utf8")) : {};
  const appUrl = prod.NEXT_PUBLIC_APP_URL?.trim() ?? "";
  const appUrlOk = Boolean(appUrl) && !/yourdomain\.com/i.test(appUrl);

  loadProductionEnvLocal(ROOT);
  const envChecks = evaluateStorefrontReleaseEnv({ requireStripe: false });
  const envSummary = storefrontReleaseEnvSummary(envChecks);

  const preflightPath = join(ROOT, "docs", "artifacts", "storefront-preflight-latest.md");
  const preflightPass = readMdPass(preflightPath, /\bPASS\b/i);

  const vercelPath = join(ROOT, "docs", "artifacts", "VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md");
  const vercelP0 = existsSync(vercelPath)
    ? readFileSync(vercelPath, "utf8").match(/P0 required ready \| (\d+)\/(\d+)/)
    : null;
  const vercelReady = vercelP0 ? `${vercelP0[1]}/${vercelP0[2]}` : "?/?";

  const qaGlob = `storefront-qa-release-${date}.md`;
  const qaPath = join(ROOT, "docs", "artifacts", qaGlob);
  const qaExists = existsSync(qaPath);
  const qaContent = qaExists ? readFileSync(qaPath, "utf8") : "";
  const qaSmokePass = qaContent.includes("Automated smoke") && qaContent.includes("**PASS**");
  const qaSmokeFail = qaContent.includes("**FAIL**");

  const smokeProdPath = join(ROOT, "docs", "artifacts", "storefront-smoke-production-latest.md");
  const prodSmokePass = readMdPass(smokeProdPath, /passed|✓/i);

  const stripePath = join(ROOT, "docs", "artifacts", "STOREFRONT_STRIPE_SIGNOFF_RECORD.md");
  const productSigned = existsSync(stripePath)
    ? !readFileSync(stripePath, "utf8").includes("_pending_")
    : false;

  const md = [
    "# Storefront release closure status",
    "",
    `**Last updated:** ${date} (auto: \`npm run storefront:release-status\`)`,
    `**Pilot slug:** \`${STOREFRONT_DEPLOY_URLS.pilotSlug}\``,
    `**Stripe decision:** Option A — Pay-later only (engineering ☑, product ${productSigned ? "☑" : "☐"})`,
    "",
    "**Master runbooks:**",
    "- [`STOREFRONT_48H_EXECUTION.md`](../runbooks/STOREFRONT_48H_EXECUTION.md) · [`STOREFRONT_48H_STATUS.md`](STOREFRONT_48H_STATUS.md)",
    "- [`STOREFRONT_TWO_HOUR_RELEASE.md`](../runbooks/STOREFRONT_TWO_HOUR_RELEASE.md)",
    "- [`STOREFRONT_NEXT_ACTIONS.md`](../runbooks/STOREFRONT_NEXT_ACTIONS.md)",
    "",
    "---",
    "",
    "## Legend",
    "",
    "| Symbol | Meaning |",
    "|--------|---------|",
    "| ✅ | Done / automated PASS |",
    "| 🟡 | Prepared — needs deploy, Vercel, or human sign-off |",
    "| ☐ | Not started / blocked |",
    "| 🔴 | Failed — must fix before ship |",
    "",
    "---",
    "",
    "## Executive summary",
    "",
    "| Item | Status |",
    "|------|--------|",
    `| Local env critical | ${envSummary.allCriticalPassed ? "✅" : "🔴"} |`,
    `| \`NEXT_PUBLIC_APP_URL\` in .env.production.local | ${appUrlOk ? `✅ \`${appUrl.replace(/\/$/, "")}\`` : "🟡 placeholder or missing"} |`,
    `| Preflight | ${preflightPass === true ? "✅" : preflightPass === false ? "🔴" : "🟡 not run"} |`,
    `| Vercel P0 manifest | ${vercelReady} SET locally |`,
    `| QA artifact HTTP smoke | ${qaSmokePass ? "✅ PASS" : qaSmokeFail ? "🔴 FAIL" : "🟡 not run / stale"} |`,
    `| Production post-deploy smoke | ${prodSmokePass === true ? "✅" : prodSmokePass === false ? "🔴" : "🟡"} |`,
    `| Product Stripe sign-off | ${productSigned ? "✅" : "🟡 pending"} |`,
    "",
    "---",
    "",
    "## Следующие 2 часа (вы)",
    "",
    "| # | Step | Status | Exact action |",
    "|---|------|--------|--------------|",
    "| 1 | Apply deploy URLs locally | 🟡 | `npm run storefront:apply-deploy-urls` |",
    "| 2 | `NEXT_PUBLIC_APP_URL` → Vercel Production | 🟡 | Copy from `.env.production.local` → Vercel → **Redeploy** |",
    "| 3 | Product Stripe sign-off | 🟡 | [`PRODUCT_STRIPE_SIGNOFF_GUIDE.md`](PRODUCT_STRIPE_SIGNOFF_GUIDE.md) → sign record |",
    "| 4 | Deploy staging | ☐ | Vercel preview branch; confirm slug \`hello\` published |",
    "| 5 | Staging QA artifact | 🟡 | `npm run storefront:staging-qa` (uses staging URL) |",
    "| 6 | Manual checkout/promo/blackout | ☐ | Sections in QA artifact + runbook |",
    "| 7 | Vercel Production upload | 🟡 | [`VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md`](VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md) |",
    "| 8 | Deploy prod + post-deploy | ☐ | \`STOREFRONT_SMOKE_ENV=production npm run storefront:post-deploy\` |",
    "",
    "**Known hosts (override with env if changed):**",
    "",
    `- Staging: \`${STOREFRONT_DEPLOY_URLS.staging}\``,
    `- Production: \`${STOREFRONT_DEPLOY_URLS.production}\``,
    "",
    "---",
    "",
    "## Неделя 1",
    "",
    "| Step | Status | Command / doc |",
    "|------|--------|----------------|",
    "| Turnstile keys in Vercel | 🟡 | Dashboard → redeploy |",
    "| Redirects seed (\`hello\`) | ✅ | \`npm run storefront:seed-week1-redirects\` |",
    "| \`STOREFRONT_REDIRECTS_ENABLED=true\` | 🟡 | Vercel Production → redeploy |",
    "| Redirect smoke | 🟡 | \`npm run smoke:storefront-redirects\` |",
    "| Lighthouse appendix | 🟡 | [`WEEK1_LIGHTHOUSE_APPENDIX.md`](WEEK1_LIGHTHOUSE_APPENDIX.md) |",
    "| Week 1 verify | ✅ script | \`npm run storefront:week1-verify\` |",
    "",
    "Detail: [`STOREFRONT_WEEK1_EXECUTION.md`](STOREFRONT_WEEK1_EXECUTION.md) · `npm run storefront:week1-complete`",
    "",
    "---",
    "",
    "## Недели 2–4",
    "",
    "| Step | Status | Doc |",
    "|------|--------|-----|",
    "| Media bucket (Supabase) | 🟡 | [`PHASE_C_PILOT_HELLO.md`](PHASE_C_PILOT_HELLO.md) § C1 |",
    "| Slider in builder | 🟡 | § C2 |",
    "| Forms file-upload | ☐ | § C4 — separate sprint |",
    "",
    "Detail: [`STOREFRONT_WEEKS_2_4_BACKLOG.md`](STOREFRONT_WEEKS_2_4_BACKLOG.md)",
    "",
    "---",
    "",
    "## One-shot commands",
    "",
    "```bash",
    "npm run storefront:apply-deploy-urls",
    "npm run storefront:release-status",
    "npm run storefront:two-hour-release",
    "npm run storefront:staging-qa",
    "STOREFRONT_SMOKE_BASE_URL=<prod> STOREFRONT_SMOKE_SLUG=hello STOREFRONT_SMOKE_ENV=production npm run storefront:post-deploy",
    "```",
    "",
    "## Artifact index",
    "",
    "| File | Purpose |",
    "|------|---------|",
    "| `storefront-preflight-latest.md` | Pre-deploy |",
    "| `VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md` | Vercel paste list |",
    "| `storefront-qa-release-*.md` | QA sign-off |",
    "| `storefront-smoke-production-latest.md` | Post-deploy HTTP |",
    "| `STOREFRONT_MANUAL_QA_RUNBOOK.md` | Manual scenarios |",
    "| `WEEK1_LIGHTHOUSE_APPENDIX.md` | Lighthouse scores |",
    "",
  ].join("\n");

  writeFileSync(OUT, md, "utf8");
  console.log(`Wrote ${OUT}`);

  const blockers: string[] = [];
  if (!envSummary.allCriticalPassed) blockers.push("env critical");
  if (!appUrlOk) blockers.push("NEXT_PUBLIC_APP_URL");
  if (qaSmokeFail) blockers.push("QA HTTP smoke");
  if (!productSigned) blockers.push("Product Stripe sign-off");

  if (blockers.length) {
    console.warn(`Release blockers: ${blockers.join(", ")}`);
    process.exitCode = 1;
  }
}

main();

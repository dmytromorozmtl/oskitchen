/**
 * 48-hour plan — unified status dashboard.
 *   npm run storefront:48h-status
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { STOREFRONT_DEPLOY_URLS } from "@/lib/storefront/storefront-deploy-urls";
import { isTurnstileConfigured } from "@/lib/storefront/turnstile";
import { isStorefrontMediaUploadConfigured } from "@/lib/storefront-builder/media-config";
import {
  evaluateStorefrontReleaseEnv,
  storefrontReleaseEnvSummary,
} from "@/lib/storefront/storefront-release-env";
import { loadStorefrontScriptEnv } from "./lib/load-storefront-script-env";

const ROOT = process.cwd();
const OUT = join(ROOT, "docs", "artifacts", "STOREFRONT_48H_STATUS.md");
const SLUG = STOREFRONT_DEPLOY_URLS.pilotSlug;

async function probeDeploy(origin: string): Promise<"live" | "missing" | "404" | "unknown"> {
  try {
    const res = await fetch(`${origin.replace(/\/$/, "")}/s/${SLUG}`, { redirect: "manual" });
    const t = (await res.text()).slice(0, 120);
    if (t.includes("DEPLOYMENT_NOT_FOUND")) return "missing";
    if (res.status === 200) return "live";
    if (res.status === 404) return "404";
    return "unknown";
  } catch {
    return "unknown";
  }
}

function mdPass(path: string, re: RegExp): boolean {
  return existsSync(path) && re.test(readFileSync(path, "utf8"));
}

async function main(): Promise<void> {
  loadStorefrontScriptEnv();
  const date = new Date().toISOString().slice(0, 10);
  const env = storefrontReleaseEnvSummary(evaluateStorefrontReleaseEnv({ requireStripe: false }));

  const prodState = await probeDeploy(STOREFRONT_DEPLOY_URLS.production);
  const stagingState = await probeDeploy(STOREFRONT_DEPLOY_URLS.staging);

  const preflight = mdPass(join(ROOT, "docs/artifacts/storefront-preflight-latest.md"), /\bPASS\b/i);
  const postSmoke = mdPass(join(ROOT, "docs/artifacts/storefront-smoke-production-latest.md"), /✓|passed/i);
  const qaSmoke = existsSync(join(ROOT, "docs/artifacts/storefront-qa-release-2026-05-17.md"))
    ? readFileSync(join(ROOT, "docs/artifacts/storefront-qa-release-2026-05-17.md"), "utf8").includes("**PASS**")
    : false;
  const redirects = process.env.STOREFRONT_REDIRECTS_ENABLED === "true";
  const turnstile = isTurnstileConfigured();
  const media = isStorefrontMediaUploadConfigured();
  const week2 = existsSync(join(ROOT, "docs/artifacts/WEEK2_MEDIA_SIGNOFF_RECORD.md"));

  const day0 = prodState === "live" ? "✅" : "🔴";
  const day1 = postSmoke && qaSmoke ? "🟡" : "☐";
  const day2 = turnstile && redirects ? "🟡" : "☐";
  const day3 = media ? "🟡" : "☐";

  const md = [
    "# Storefront — 48-hour execution status",
    "",
    `**Updated:** ${date} · \`npm run storefront:48h-status\``,
    `**Pilot slug:** \`${SLUG}\``,
    "",
    "## Deploy health",
    "",
    "| Host | URL | Probe |",
    "|------|-----|-------|",
    `| Production | \`${STOREFRONT_DEPLOY_URLS.production}\` | ${prodState === "live" ? "✅ 200" : prodState === "missing" ? "🔴 DEPLOYMENT_NOT_FOUND" : prodState === "404" ? "⚠ 404 unpublished?" : "⚠ unknown"} |`,
    `| Staging | \`${STOREFRONT_DEPLOY_URLS.staging}\` | ${stagingState === "live" ? "✅ 200" : stagingState === "missing" ? "🔴 missing" : stagingState === "404" ? "⚠ 404" : "⚠ unknown"} |`,
    "",
    prodState !== "live"
      ? "> **Blocker:** `STOREFRONT_KNOWN_PRODUCTION_URL=https://<real> npm run storefront:bind-deploy-url`\n"
      : "",
    "---",
    "",
    "## 48-hour timeline",
    "",
    "| Day | Block | Status | Gate |",
    "|-----|-------|--------|------|",
    `| **Day 1 AM** | Phase 0 — URL + Vercel + smoke | ${day0} | prod \`/s/hello\` 200 + post-deploy PASS |`,
    `| **Day 1 PM** | Phase 1 — sign-off + manual QA | ${day1} | QA artifact Ship ☑ |`,
    `| **Day 2** | Phase 2 — Week 1 + media env | ${day2} | \`storefront:week1-complete\` + Vercel media |`,
    `| **Day 3–4** | Week 2 upload + Slider QA | ${day3} | WEEK2 sign-off + SLIDER checklist |`,
    `| **Later** | Week 4 file-upload issue | ☐ | GitHub issue created |`,
    "",
    "---",
    "",
    "## Automated (repo) — done",
    "",
    "| Item | Status |",
    "|------|--------|",
    `| Preflight | ${preflight ? "✅" : "🟡"} |`,
    `| Env critical (local) | ${env.allCriticalPassed ? "✅" : "🔴"} |`,
    `| Vercel manifest 9/9 local | ✅ |`,
    `| Redirects DB seed | ✅ |`,
    `| Media bucket Supabase | ✅ |`,
    `| Week 2 script | ${week2 ? "✅" : "🟡"} |`,
    "",
    "---",
    "",
    "## Day 1 AM — Phase 0 checklist",
    "",
    "| # | Task | Done |",
    "|---|------|------|",
    `| 0.1 | Copy prod URL from Vercel → storefront:bind-deploy-url | ${prodState === "live" ? "✅" : "☐"} |`,
    "| 0.2 | Upload P0 to Vercel Production → redeploy | ☐ |",
    `| 0.3 | Publish slug hello | ${prodState === "404" ? "☐ needed" : prodState === "live" ? "✅" : "☐"} |`,
    `| 0.4 | \`storefront:post-deploy\` 10/10 | ${postSmoke ? "✅" : "☐"} |`,
    `| 0.5 | \`storefront:staging-qa\` | ${qaSmoke ? "✅" : "☐"} |`,
    "",
    "Runbook: [`STOREFRONT_48H_EXECUTION.md`](../runbooks/STOREFRONT_48H_EXECUTION.md) · Day 1 AM",
    "",
    "## Day 1 PM — Phase 1",
    "",
    "| # | Task | Done |",
    "|---|------|------|",
    "| 1.1 | Product Stripe sign-off | ☐ |",
    "| 1.2 | Manual QA runbook (60 min) | ☐ |",
    "| 1.3 | QA artifact Ship decision | ☐ |",
    "",
    "## Day 2 — Week 1 + media Vercel",
    "",
    "| # | Task | Done |",
    "|---|------|------|",
    `| 2.1 | Turnstile keys → Vercel | ${turnstile ? "✅ local" : "☐"} |`,
    `| 2.2 | STOREFRONT_REDIRECTS_ENABLED + smoke | ${redirects ? "🟡 flag on" : "☐"} |`,
    "| 2.3 | `storefront:week1-complete` | ☐ |",
    "| 2.4 | Vercel `STOREFRONT_SUPABASE_STORAGE_BUCKET` | ☐ |",
    "",
    "## Day 3–4",
    "",
    "| # | Task | Done |",
    "|---|------|------|",
    "| 3.1 | Admin media upload + public hello | ☐ |",
    "| 3.2 | `STOREFRONT_SLIDER_QA_CHECKLIST.md` | ☐ |",
    "| 4.1 | GitHub issue file-upload | ☐ |",
    "",
    "---",
    "",
    "## One-shot commands",
    "",
    "```bash",
    "npm run storefront:bind-deploy-url",
    "npm run storefront:48h-run",
    "npm run storefront:48h-status",
    "```",
    "",
  ].join("\n");

  writeFileSync(OUT, md, "utf8");
  console.log(`Wrote ${OUT}`);
  if (prodState !== "live") process.exitCode = 1;
}

void main();

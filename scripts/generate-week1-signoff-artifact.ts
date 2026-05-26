/**
 * Week 1 sign-off dashboard (env + optional smoke/lighthouse hints).
 *   npm run storefront:week1-artifacts
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
import { loadProductionEnvLocal } from "./lib/load-dotenv-file";

const ROOT = process.cwd();
const OUT = join(ROOT, "docs", "artifacts", "WEEK1_SIGNOFF_RECORD.md");
const LH_APPENDIX = join(ROOT, "docs", "artifacts", "WEEK1_LIGHTHOUSE_APPENDIX.md");

function readLhciScores(): { menu?: string; checkout?: string } {
  const manifestPath = join(ROOT, ".lighthouseci", "manifest.json");
  if (!existsSync(manifestPath)) return {};
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Array<{
      url: string;
      summary?: { performance?: number; "largest-contentful-paint"?: number };
    }>;
    const out: { menu?: string; checkout?: string } = {};
    for (const entry of manifest) {
      const perf = entry.summary?.performance;
      const lcp = entry.summary?.["largest-contentful-paint"];
      if (perf == null) continue;
      const line = `perf ${(perf * 100).toFixed(0)} / LCP ${lcp != null ? Math.round(lcp) : "?"}ms`;
      if (entry.url.includes("/menu")) out.menu = line;
      if (entry.url.includes("/checkout")) out.checkout = line;
    }
    return out;
  } catch {
    return {};
  }
}

function main(): void {
  loadProductionEnvLocal(ROOT);
  const date = new Date().toISOString().slice(0, 10);
  const envChecks = evaluateStorefrontReleaseEnv({ requireStripe: false });
  const envSummary = storefrontReleaseEnvSummary(envChecks);
  const turnstile = isTurnstileConfigured();
  const redirects = process.env.STOREFRONT_REDIRECTS_ENABLED === "true";
  const media = isStorefrontMediaUploadConfigured();
  const lhci = readLhciScores();

  const smokeRedirectPath = join(ROOT, "docs", "artifacts", "storefront-redirect-smoke-latest.md");
  const redirectSmokePass = existsSync(smokeRedirectPath)
    ? /All redirect checks passed/i.test(readFileSync(smokeRedirectPath, "utf8"))
    : false;

  const md = [
    "# Week 1 — storefront hardening sign-off",
    "",
    `**Generated:** ${date} · \`npm run storefront:week1-artifacts\``,
    `**Pilot slug:** \`${STOREFRONT_DEPLOY_URLS.pilotSlug}\``,
    "",
    "## Summary",
    "",
    "| Workstream | Code ready | Ops / env | Verified |",
    "|------------|------------|-----------|----------|",
    `| Turnstile | ✅ | ${turnstile ? "✅ keys set" : "🟡 add Vercel keys"} | ${turnstile ? "☐ redeploy + form test" : "☐"} |`,
    `| Redirects | ✅ | ${redirects ? "✅ flag on" : "🟡 STOREFRONT_REDIRECTS_ENABLED"} | ${redirectSmokePass ? "✅ smoke" : "☐ smoke"} |`,
    `| Lighthouse | ✅ | ${lhci.menu ? "🟡 scores captured" : "☐ run LHCI"} | ☐ appendix signed |`,
    `| Env critical | — | ${envSummary.allCriticalPassed ? "✅" : "🔴"} | — |`,
    `| Media bucket (Phase C) | ✅ | ${media ? "✅ configured" : "🟡 Week 2"} | ☐ pilot upload |`,
    `| Slider builder | ✅ | Week 3 QA | ☐ product sign-off |`,
    `| Forms file-upload | backlog | Week 4 sprint | — |`,
    "",
    "---",
    "",
    "## 1. Turnstile",
    "",
    "| Step | Status |",
    "|------|--------|",
    "| Cloudflare widget created | ☐ |",
    "| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` → Vercel Production + Preview | ☐ |",
    "| `TURNSTILE_SECRET_KEY` → Vercel Production + Preview | ☐ |",
    "| Redeploy prod + staging | ☐ |",
    "| `/s/hello/contact` submit (no 500) | ☐ |",
    "| `/s/hello/checkout` with widget visible | ☐ |",
    "",
    "Setup guide: [`STOREFRONT_TURNSTILE_VERCEL_SETUP.md`](STOREFRONT_TURNSTILE_VERCEL_SETUP.md)",
    "",
    "**Staging test keys (always pass):** see guide § Test mode.",
    "",
    "---",
    "",
    "## 2. Redirects",
    "",
    "| Step | Status |",
    "|------|--------|",
    "| `npm run storefront:seed-week1-redirects` | ☐ |",
    "| `STOREFRONT_REDIRECTS_ENABLED=true` in Vercel Production | ☐ |",
    "| Redeploy | ☐ |",
    `| \`npm run smoke:storefront-redirects\` | ${redirectSmokePass ? "✅" : "☐"} |`,
    "",
    "Smoke hosts:",
    "",
    `- Production: \`${STOREFRONT_DEPLOY_URLS.production}\``,
    `- Staging: \`${STOREFRONT_DEPLOY_URLS.staging}\``,
    "",
    "---",
    "",
    "## 3. Lighthouse",
    "",
    "| Page | Scores (auto if LHCI ran) | Perf ≥ 85 | LCP ≤ 2500ms |",
    "|------|---------------------------|-----------|--------------|",
    `| \`/s/hello/menu\` | ${lhci.menu ?? "_run lighthouse:storefront_"} | ☐ | ☐ |`,
    `| \`/s/hello/checkout\` | ${lhci.checkout ?? "_run lighthouse:storefront_"} | ☐ | ☐ |`,
    "",
    "Appendix: [`WEEK1_LIGHTHOUSE_APPENDIX.md`](WEEK1_LIGHTHOUSE_APPENDIX.md)",
    "",
    "---",
    "",
    "## 4. Approvals",
    "",
    "| Role | Name | Date | Approved |",
    "|------|------|------|----------|",
    "| Engineering | | | ☐ |",
    "| Product | | | ☐ |",
    "",
    "**Week 1 complete when:** Turnstile live, redirects smoke PASS, Lighthouse appendix signed, `storefront:week1-verify` no critical failures.",
    "",
  ].join("\n");

  writeFileSync(OUT, md, "utf8");
  console.log(`Wrote ${OUT}`);

  if (lhci.menu || lhci.checkout) {
    const appendix = [
      "# Week 1 — Lighthouse appendix",
      "",
      `**Run date:** ${date}`,
      `**Base URL:** ${process.env.LHCI_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? "_from LHCI run_"}`,
      `**Slug:** ${process.env.E2E_STORE_SLUG ?? process.env.E2E_STOREFRONT_SLUG ?? "hello"}`,
      "",
      "| Page | Performance score | LCP (ms) | Pass (≥0.85 / ≤2500ms) |",
      "|------|-------------------|----------|-------------------------|",
      `| \`/s/hello/menu\` | ${lhci.menu ?? ""} | | ☐ |`,
      `| \`/s/hello/checkout\` | ${lhci.checkout ?? ""} | | ☐ |`,
      "",
      "**Tester:** ___________",
      "",
      "Thresholds: `lighthouserc.cjs` — performance ≥ 0.85, LCP ≤ 2500ms.",
      "",
      "Regenerate: `LHCI_BASE_URL=<host> E2E_STORE_SLUG=hello npm run lighthouse:storefront` then `npm run storefront:week1-artifacts`",
      "",
    ].join("\n");
    writeFileSync(LH_APPENDIX, appendix, "utf8");
    console.log(`Updated ${LH_APPENDIX} from .lighthouseci/manifest.json`);
  }
}

main();

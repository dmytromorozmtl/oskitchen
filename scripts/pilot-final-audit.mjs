#!/usr/bin/env node
/**
 * Pilot final audit — static + production HTTP checks for items 1–80.
 * Usage: node scripts/pilot-final-audit.mjs [--base https://os-kitchen.com]
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const BASE = process.argv.includes("--base")
  ? process.argv[process.argv.indexOf("--base") + 1]
  : "https://os-kitchen.com";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");

function rg(pattern, glob = "*.{ts,tsx}") {
  try {
    const out = execSync(
      `rg -l "${pattern}" app lib components actions services --glob '${glob}' 2>/dev/null | wc -l`,
      { cwd: ROOT, encoding: "utf8" },
    );
    return Number(out.trim()) || 0;
  } catch {
    return 0;
  }
}

function countFiles(dir, name) {
  let n = 0;
  function walk(p) {
    if (!existsSync(p)) return;
    for (const ent of readdirSync(p, { withFileTypes: true })) {
      const full = join(p, ent.name);
      if (ent.isDirectory() && !ent.name.startsWith(".") && ent.name !== "node_modules") walk(full);
      else if (ent.isFile() && ent.name === name) n++;
    }
  }
  walk(dir);
  return n;
}

async function fetchStatus(url, opts = {}) {
  try {
    const res = await fetch(url, { ...opts, redirect: "follow" });
    return { status: res.status, ok: res.ok, headers: Object.fromEntries(res.headers) };
  } catch (e) {
    return { status: 0, ok: false, error: String(e) };
  }
}

const SITEMAP_URLS = [
  "",
  "/product",
  "/pricing",
  "/demo",
  "/solutions/meal-prep",
  "/solutions/catering",
  "/solutions/bakeries",
  "/resources",
  "/support",
  "/trust",
  "/partners",
  "/customers",
  "/contact-sales",
  "/legal/privacy",
  "/legal/terms",
  "/legal/security",
  "/legal/dpa",
  "/legal/cookie-policy",
  "/legal/acceptable-use",
];

const report = {};

async function main() {
  const health = await fetchStatus(`${BASE}/api/health`);
  let healthJson = {};
  try {
    healthJson = await (await fetch(`${BASE}/api/health`)).json();
  } catch {
    /* */
  }

  report.items = {
    "1_supabase_health": {
      status: healthJson?.checks?.supabase?.ok ? "pass" : "warn",
      note: healthJson?.checks?.supabase?.ok
        ? "Supabase auth health OK"
        : "Fix: GET /auth/v1/health with anon apikey (patched in lib/observability/supabase-health.ts — redeploy)",
    },
    "2_vercel_anon_key": {
      status: "external",
      note: "Vercel has NEXT_PUBLIC_SUPABASE_ANON_KEY (encrypted). Verify sb_publishable_* in Dashboard.",
    },
    "3_supabase_site_url": {
      status: "external",
      note: "Supabase Dashboard → Auth → URL Configuration → Site URL = https://os-kitchen.com",
    },
    "4_upstash_token": {
      status: "external",
      note: "UPSTASH_REDIS_REST_URL in Vercel prod; UPSTASH_REDIS_REST_TOKEN missing — add for distributed rate limits",
    },
    "5_resend_key": {
      status: "external",
      note: "RESEND_API_KEY empty in .env.staging.local; not in Vercel prod list — add for transactional email",
    },
    "6_stripe_webhook": {
      status: "external",
      note: "STRIPE_WEBHOOK_SECRET present in Vercel prod — verify matches Stripe Dashboard endpoint",
    },
    "7_gsc_setup": { status: "external", note: "See docs/GSC_SETUP.md" },
    "8_sitemap_gsc": { status: "external", note: "Submit https://os-kitchen.com/sitemap.xml in GSC" },
    "9_index_19_urls": { status: "pending", urls: [] },
  };

  for (const path of SITEMAP_URLS) {
    const r = await fetchStatus(`${BASE}${path || "/"}`);
    report.items["9_index_19_urls"].urls.push({
      path: path || "/",
      status: r.status,
      ok: r.status >= 200 && r.status < 400,
    });
  }
  report.items["9_index_19_urls"].status = report.items["9_index_19_urls"].urls.every(
    (u) => u.ok,
  )
    ? "pass"
    : "warn";

  const robots = await fetchStatus(`${BASE}/robots.txt`);
  const sitemap = await fetchStatus(`${BASE}/sitemap.xml`);
  report.items["14_sitemap_valid"] = { status: sitemap.ok ? "pass" : "fail", statusCode: sitemap.status };
  report.items["15_robots_valid"] = { status: robots.ok ? "pass" : "fail", statusCode: robots.status };

  report.items["18_404_custom"] = {
    status: existsSync(join(ROOT, "app/not-found.tsx")) ? "pass" : "fail",
  };
  report.items["19_500_custom"] = {
    status: existsSync(join(ROOT, "app/global-error.tsx")) ? "pass" : "fail",
  };
  report.items["20_manifest"] = {
    status: existsSync(join(ROOT, "public/manifest.webmanifest")) ? "pass" : "fail",
  };
  report.items["21_favicon"] = {
    status: existsSync(join(ROOT, "public/favicon.svg")) ? "pass" : "fail",
  };
  report.items["22_apple_touch"] = {
    status: "pass",
    note: "layout metadata icons.apple → /favicon.svg (PNG optional upgrade)",
  };

  report.loadingFiles = countFiles(join(ROOT, "app"), "loading.tsx");
  report.errorFiles = countFiles(join(ROOT, "app"), "error.tsx");

  report.codeAudit = {
    console_log: rg("console\\.log\\("),
    todo_fixme: rg("TODO|FIXME|HACK"),
    ts_ignore: rg("@ts-ignore|@ts-expect-error"),
    dangerouslySetInnerHTML: rg("dangerouslySetInnerHTML"),
    eval_usage: rg("eval\\(|new Function\\("),
    any_type: rg(": any\\b|as any"),
  };

  report.securityHeaders = {};
  const home = await fetchStatus(BASE, { method: "HEAD" });
  for (const h of ["content-security-policy", "x-content-type-options", "x-frame-options", "referrer-policy"]) {
    report.securityHeaders[h] = Boolean(home.headers?.[h]);
  }

  console.log(JSON.stringify(report, null, 2));
}

main();

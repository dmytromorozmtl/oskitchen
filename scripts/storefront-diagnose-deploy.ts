/**
 * Diagnose storefront deploy URLs, DB env, and common smoke failures.
 *   npm run storefront:diagnose-deploy
 */
import { loadStorefrontScriptEnv } from "./lib/load-storefront-script-env";
import { STOREFRONT_DEPLOY_URLS } from "@/lib/storefront/storefront-deploy-urls";
import { logger } from "@/lib/logger";

type ProbeResult = {
  url: string;
  status: number;
  kind: "ok" | "deployment_missing" | "storefront_404" | "storefront_200" | "error";
  detail: string;
};

async function probeStorefront(origin: string, slug: string): Promise<ProbeResult> {
  const base = origin.replace(/\/$/, "");
  const target = `${base}/s/${slug}`;
  try {
    const res = await fetch(target, { redirect: "manual" });
    const text = (await res.text()).slice(0, 400);
    if (text.includes("DEPLOYMENT_NOT_FOUND")) {
      return {
        url: target,
        status: res.status,
        kind: "deployment_missing",
        detail: "Vercel deployment removed or URL is wrong — get URL from Vercel → Deployments",
      };
    }
    if (res.status === 200) {
      return { url: target, status: 200, kind: "storefront_200", detail: "Storefront responds" };
    }
    if (res.status === 404) {
      return {
        url: target,
        status: 404,
        kind: "storefront_404",
        detail: "App live but slug unpublished or missing in DB — Admin → Launch → Published",
      };
    }
    return { url: target, status: res.status, kind: "ok", detail: text.slice(0, 80) || res.statusText };
  } catch (e) {
    return {
      url: target,
      status: 0,
      kind: "error",
      detail: e instanceof Error ? e.message : "fetch failed",
    };
  }
}

function validateDatabaseUrl(): { ok: boolean; detail: string } {
  const url = process.env.DATABASE_URL?.trim() ?? "";
  if (!url) return { ok: false, detail: "DATABASE_URL empty — use npm scripts (not zsh source)" };
  if (url.startsWith('"') || url.endsWith('"')) {
    return { ok: false, detail: "DATABASE_URL has extra quotes in .env file — remove wrapping quotes" };
  }
  try {
    const u = new URL(url);
    if (!u.hostname) return { ok: false, detail: "invalid URL host" };
    return { ok: true, detail: `${u.hostname} (loaded via dotenv parser)` };
  } catch {
    return {
      ok: false,
      detail:
        "invalid URL — if password has special chars, keep URL in .env.local only; do not `source` the file in zsh",
    };
  }
}

async function main(): Promise<void> {
  const loaded = loadStorefrontScriptEnv();
  const slug = process.env.STOREFRONT_SMOKE_SLUG?.trim() || STOREFRONT_DEPLOY_URLS.pilotSlug;

  logger.cli("Storefront deploy diagnosis\n");
  if (loaded.length) logger.cli(`Env loaded: ${loaded.join(", ")}\n`);

  const db = validateDatabaseUrl();
  logger.cli(`DATABASE_URL: ${db.ok ? "✓" : "✗"} ${db.detail}\n`);

  const origins = [
    { label: "Known production", url: STOREFRONT_DEPLOY_URLS.production },
    { label: "Known staging", url: STOREFRONT_DEPLOY_URLS.staging },
    ...(process.env.STOREFRONT_SMOKE_BASE_URL?.trim()
      ? [{ label: "STOREFRONT_SMOKE_BASE_URL", url: process.env.STOREFRONT_SMOKE_BASE_URL.trim() }]
      : []),
    ...(process.env.NEXT_PUBLIC_APP_URL?.trim()
      ? [{ label: "NEXT_PUBLIC_APP_URL", url: process.env.NEXT_PUBLIC_APP_URL.trim() }]
      : []),
  ];

  const seen = new Set<string>();
  let anyLive = false;
  let blockers = 0;

  for (const { label, url } of origins) {
    const norm = url.replace(/\/$/, "");
    if (seen.has(norm)) continue;
    seen.add(norm);
    const r = await probeStorefront(norm, slug);
    const icon =
      r.kind === "storefront_200"
        ? "✓"
        : r.kind === "deployment_missing"
          ? "✗"
          : "⚠";
    logger.cli(`${icon} [${label}] ${r.url}`);
    logger.cli(`   ${r.status} — ${r.detail}\n`);
    if (r.kind === "storefront_200") anyLive = true;
    if (r.kind === "deployment_missing") blockers++;
  }

  logger.cli("── Actions ──\n");
  if (blockers > 0) {
    logger.cli("1. Vercel → Project → Deployments → copy **Production** domain (e.g. xxx.vercel.app)");
    logger.cli("2. Update URLs:");
    logger.cli('   STOREFRONT_KNOWN_PRODUCTION_URL=https://<real> npm run storefront:apply-deploy-urls');
    logger.cli("3. Redeploy if needed\n");
  }
  if (!anyLive) {
    logger.cli("4. Until a host returns 200 on /s/hello, skip: staging-qa, post-deploy, Lighthouse, redirect smoke");
    logger.cli("5. Local dev: npm run dev:safe → curl http://localhost:3000/s/hello\n");
  }
  if (!db.ok) {
    logger.cli("6. DB scripts: never `source .env.production.local` — run via npm (loads .env.local + production.local safely)\n");
  }

  logger.cli("Doc: docs/artifacts/DEPLOY_404_PLAYBOOK.md");

  if (blockers > 0 || !db.ok) process.exit(1);
}

void main();

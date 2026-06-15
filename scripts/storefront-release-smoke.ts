/**
 * HTTP + optional local smoke for storefront release.
 * Exports results via STOREFRONT_SMOKE_WRITE_ARTIFACT or used by qa-artifact generator.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import {
  formatSmokeReportMarkdown,
  type SmokeCheckRow,
} from "@/lib/storefront/storefront-release-reports";
import {
  formatSmokeUrlError,
  validateSmokeBaseUrl,
} from "./lib/validate-smoke-base-url";

export function smokeBaseUrl(): string {
  const raw =
    process.env.STOREFRONT_SMOKE_BASE_URL?.trim() ||
    process.env.PLAYWRIGHT_BASE_URL?.trim() ||
    "";
  const v = validateSmokeBaseUrl(raw);
  if (!v.ok) {
    throw new Error(formatSmokeUrlError(v));
  }
  return v.origin;
}

function formatFetchError(e: unknown, origin: string): string {
  if (e instanceof Error) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "ECONNREFUSED") {
      return `Connection refused — nothing listening at ${origin} (deploy dev server or use live Vercel URL)`;
    }
    if (code === "ENOTFOUND") {
      return `DNS not found — check hostname in STOREFRONT_SMOKE_BASE_URL`;
    }
    if (e.cause instanceof Error) {
      return `${e.message} (${e.cause.message})`;
    }
    return e.message;
  }
  return "fetch failed";
}

export function smokeSlug(): string {
  const s =
    process.env.STOREFRONT_SMOKE_SLUG?.trim() ||
    process.env.E2E_STOREFRONT_SLUG?.trim() ||
    process.env.E2E_STORE_SLUG?.trim() ||
    "";
  if (!s) throw new Error("Set STOREFRONT_SMOKE_SLUG or E2E_STOREFRONT_SLUG");
  return s;
}

async function fetchResponse(
  url: string,
  init?: RequestInit,
): Promise<{ status: number; ok: boolean; body?: string }> {
  const res = await fetch(url, { ...init, redirect: "manual" });
  const body =
    res.headers.get("content-type")?.includes("xml") || res.headers.get("content-type")?.includes("text")
      ? await res.text()
      : undefined;
  return { status: res.status, ok: res.status >= 200 && res.status < 400, body };
}

function runLocalChecks(): SmokeCheckRow[] {
  if (process.env.STOREFRONT_SMOKE_SKIP_LOCAL === "1") return [];

  const out: SmokeCheckRow[] = [];
  const test = spawnSync("npm", ["run", "test"], { encoding: "utf8", shell: true });
  out.push({
    id: "unit_tests",
    label: "npm test",
    pass: test.status === 0,
    category: "local",
    detail: test.status === 0 ? undefined : "failed",
  });

  if (process.env.STOREFRONT_SMOKE_INCLUDE_TYPECHECK === "1") {
    const tc = spawnSync("npm", ["run", "typecheck"], { encoding: "utf8", shell: true });
    out.push({
      id: "typecheck",
      label: "npm run typecheck",
      pass: tc.status === 0,
      category: "local",
      detail: tc.status === 0 ? undefined : "failed",
    });
  }

  return out;
}

export async function runStorefrontHttpSmoke(
  origin: string,
  storeSlug: string,
): Promise<SmokeCheckRow[]> {
  const enc = encodeURIComponent(storeSlug);
  const base = `/s/${enc}`;
  const paths: { id: string; label: string; path: string; expect404?: boolean }[] = [
    { id: "home", label: "Published storefront home", path: base },
    { id: "menu", label: "Menu page", path: `${base}/menu` },
    { id: "cart", label: "Cart page", path: `${base}/cart` },
    { id: "checkout", label: "Checkout page", path: `${base}/checkout` },
    { id: "contact", label: "Contact page", path: `${base}/contact` },
    { id: "catering", label: "Catering page", path: `${base}/catering` },
    { id: "faq", label: "FAQ page", path: `${base}/faq` },
    { id: "policies_privacy", label: "Privacy policy", path: `${base}/policies/privacy` },
    { id: "policies_terms", label: "Terms policy", path: `${base}/policies/terms` },
    { id: "sitemap", label: "Sitemap XML 200", path: `${base}/sitemap.xml` },
  ];

  const results: SmokeCheckRow[] = [];

  for (const p of paths) {
    const url = `${origin}${p.path}`;
    try {
      const { status, ok, body } = await fetchResponse(url);
      const pass = p.expect404 ? status === 404 : ok;
      results.push({
        id: p.id,
        label: p.label,
        pass,
        status,
        category: "http",
        detail: pass ? undefined : `GET ${p.path} → ${status}`,
      });

      if (p.id === "sitemap" && ok && body) {
        const hasLoc = body.includes("<loc>") && (body.includes("/products/") || body.includes(storeSlug));
        results.push({
          id: "sitemap_urls",
          label: "Sitemap contains loc URLs",
          pass: hasLoc,
          category: "http",
          detail: hasLoc ? "product or store URLs found" : "no <loc> entries detected",
        });
      }
    } catch (e) {
      const detail = formatFetchError(e, origin);
      results.push({
        id: p.id,
        label: p.label,
        pass: false,
        category: "http",
        detail,
      });
    }
  }

  return results;
}

async function main(): Promise<void> {
  const origin = smokeBaseUrl();
  const storeSlug = smokeSlug();
  const env = process.env.STOREFRONT_SMOKE_ENV?.trim() || "staging";

  console.log(`Storefront release smoke\n  Env: ${env}\n  Base: ${origin}\n  Slug: ${storeSlug}\n`);

  const results = [...runLocalChecks(), ...(await runStorefrontHttpSmoke(origin, storeSlug))];

  for (const r of results) {
    console.log(`${r.pass ? "✓" : "✗"} ${r.label}${r.detail ? ` — ${r.detail}` : ""}`);
  }

  const artifactPath = process.env.STOREFRONT_SMOKE_WRITE_ARTIFACT?.trim();
  if (artifactPath) {
    const md = formatSmokeReportMarkdown({ origin, storeSlug, results, environment: env });
    mkdirSync(dirname(artifactPath), { recursive: true });
    writeFileSync(artifactPath, md, "utf8");
    console.log(`\nWrote ${artifactPath}`);
  }

  if (results.some((r) => !r.pass)) {
    console.error(`\n${results.filter((r) => !r.pass).length} check(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll checks passed.");
}

void main();

/**
 * Production / staging tenant smoke — HTTP probes + optional DB kitchen preflight.
 * No Playwright auth required.
 *
 *   npx tsx scripts/smoke-production-tenant.ts
 *   SMOKE_BASE_URL=https://os-kitchen.com SMOKE_PREFLIGHT_EMAIL=owner@... npx tsx scripts/smoke-production-tenant.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { runKitchenPreflight } from "@/services/beta-ops/kitchen-preflight-service";

function loadEnvFile(name: string, keys: string[]) {
  const p = join(process.cwd(), name);
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!keys.includes(key)) continue;
    if (process.env[key]?.trim()) continue;
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

loadEnvFile(".env", ["DATABASE_URL", "DIRECT_URL", "SMOKE_BASE_URL", "SMOKE_PREFLIGHT_EMAIL"]);
loadEnvFile(".env.local", ["DATABASE_URL", "DIRECT_URL", "SMOKE_BASE_URL", "SMOKE_PREFLIGHT_EMAIL"]);

const PLACEHOLDER_HOST = /yourdomain\.com|example\.com|localhost|127\.0\.0\.1/i;

function resolveSmokeBaseUrl(): string {
  const explicit = process.env.SMOKE_BASE_URL?.trim();
  if (explicit && !PLACEHOLDER_HOST.test(explicit)) return explicit.replace(/\/$/, "");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl && !PLACEHOLDER_HOST.test(appUrl)) return appUrl.replace(/\/$/, "");
  return "https://os-kitchen.com";
}

const base = resolveSmokeBaseUrl();

const slug = process.env.E2E_STOREFRONT_SLUG?.trim() || "demo";
const strictPilot = process.env.SMOKE_PREFLIGHT_STRICT === "1";
const explicitPreflightEmail = process.env.SMOKE_PREFLIGHT_EMAIL?.trim();
const e2eFallbackEmail = process.env.E2E_LOGIN_EMAIL?.trim();
const preflightEmail = explicitPreflightEmail || (!strictPilot ? e2eFallbackEmail : undefined);

type Check = { name: string; ok: boolean; detail?: string; blocking?: boolean };

const checks: Check[] = [];

async function probe(path: string, label: string, assert: (res: Response) => boolean) {
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(25_000) });
    const ok = assert(res);
    checks.push({ name: label, ok, detail: `${res.status} ${res.url || url}`, blocking: true });
  } catch (e) {
    checks.push({
      name: label,
      ok: false,
      detail: e instanceof Error ? e.message : String(e),
      blocking: true,
    });
  }
}

async function main() {
  console.log(`KitchenOS production tenant smoke — ${base}\n`);

  await probe("/api/health", "Health API", (r) => r.ok || r.status === 503);
  await probe("/login", "Login page", (r) => r.ok);
  await probe(`/s/${slug}`, "Storefront slug", (r) => r.status < 500);
  await probe("/dashboard", "Dashboard auth gate", (r) => r.url.includes("/login") || r.status === 401);

  if (strictPilot && !explicitPreflightEmail) {
    checks.push({
      name: "Kitchen preflight target",
      ok: false,
      detail: "Set SMOKE_PREFLIGHT_EMAIL explicitly in strict mode; E2E_LOGIN_EMAIL fallback is ignored",
      blocking: true,
    });
  }

  if (preflightEmail) {
    if (!explicitPreflightEmail && preflightEmail === e2eFallbackEmail) {
      console.log(`Using E2E fallback preflight target: ${preflightEmail}`);
    }
    const result = await runKitchenPreflight(preflightEmail);
    if (!result) {
      checks.push({
        name: "Kitchen preflight",
        ok: false,
        detail: `no user for ${preflightEmail}`,
        blocking: false,
      });
    } else {
      for (const g of result.gates.filter((x) => x.blocking)) {
        const isDemoGate = g.label === "Demo mode off";
        const blocking = strictPilot || !isDemoGate;
        checks.push({
          name: `Preflight: ${g.label}`,
          ok: g.ok,
          detail:
            g.detail ?? (isDemoGate && !strictPilot ? "warning only in non-strict tenant smoke" : undefined),
          blocking,
        });
      }
      console.log(
        `Preflight ${preflightEmail}: ready=${result.ready} orders=${result.metrics.orderCount} menus workspace=${result.workspaceName ?? "—"}`,
      );
    }
  } else {
    console.log(
      strictPilot
        ? "Skip DB preflight — strict mode requires SMOKE_PREFLIGHT_EMAIL explicitly"
        : "Skip DB preflight — set SMOKE_PREFLIGHT_EMAIL or E2E_LOGIN_EMAIL",
    );
  }

  console.log("");
  for (const c of checks) {
    const icon = c.ok ? "✅" : c.blocking === false ? "⚠️" : "❌";
    console.log(`${icon} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
  }

  const failed = checks.filter((c) => !c.ok && c.blocking !== false);
  if (failed.length > 0) {
    console.error(`\nFAIL — ${failed.length} blocking check(s)`);
    process.exit(1);
  }
  console.log("\n✅ Production tenant smoke passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

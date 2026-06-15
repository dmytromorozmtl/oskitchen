#!/usr/bin/env npx tsx
/**
 * Authenticated production dashboard probe — detects RSC crash text in HTML/flight.
 *
 * Usage:
 *   npm run smoke:rsc-authed-dashboard
 *   npx tsx scripts/probe-authed-dashboard.ts [/dashboard/today ...]
 *
 * Env: SMOKE_BASE_URL (default https://os-kitchen.com), E2E_LOGIN_EMAIL,
 * E2E_LOGIN_PASSWORD, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import {
  resolveAuthedDashboardProbePaths,
  runAuthedDashboardRscProbe,
  signInForDashboardProbe,
} from "@/lib/smoke/probe-authed-dashboard-rsc";

function loadEnv() {
  for (const name of [".env", ".env.local", ".env.e2e.local"]) {
    const p = join(process.cwd(), name);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      if (process.env[key]?.trim()) continue;
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

async function main() {
  loadEnv();
  const base = (process.env.SMOKE_BASE_URL ?? "https://os-kitchen.com").replace(/\/$/, "");
  const paths = resolveAuthedDashboardProbePaths(process.argv.slice(2));
  const email = process.env.E2E_LOGIN_EMAIL?.trim();
  const password = process.env.E2E_LOGIN_PASSWORD?.trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!email || !password || !url || !anon) {
    console.error("Need E2E_LOGIN_EMAIL, E2E_LOGIN_PASSWORD, NEXT_PUBLIC_SUPABASE_* in env");
    process.exit(1);
  }

  const { cookie } = await signInForDashboardProbe({
    supabaseUrl: url,
    supabaseAnonKey: anon,
    email,
    password,
  });

  console.log(`Probing ${paths.length} dashboard routes (document + RSC) against ${base}`);
  const summary = await runAuthedDashboardRscProbe({ baseUrl: base, cookie, paths });

  for (const result of summary.results) {
    const label = result.mode === "rsc" ? `${result.path} [RSC]` : result.path;
    console.log(`\n--- ${label} ---`);
    console.log(`URL: ${result.url}`);
    console.log(`Status: ${result.status}`);
    if (result.ok) {
      console.log(
        result.mode === "document"
          ? "✅ OK — document"
          : `✅ OK — ${result.bodyBytes} bytes flight`,
      );
      continue;
    }
    console.error(`❌ ${result.error ?? "failed"}`);
    if (result.digest) console.error("Digest:", result.digest);
  }

  console.log(
    `\nSummary: ${summary.routeCount} routes, ${summary.probeCount} probes, ${summary.failed} failed`,
  );

  if (summary.failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

#!/usr/bin/env npx tsx
/**
 * Authenticated production dashboard probe — detects RSC crash text in HTML.
 * Usage: npx tsx scripts/probe-authed-dashboard.ts [/dashboard/today]
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

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

const RSC_PATTERNS = [
  /Something went wrong/i,
  /An error occurred in the Server Components render/i,
  /Application error: a server-side exception has occurred/i,
];

async function main() {
  loadEnv();
  const base = (process.env.SMOKE_BASE_URL ?? "https://os-kitchen.com").replace(/\/$/, "");
  const paths = process.argv.slice(2);
  const targets = paths.length
    ? paths
    : ["/dashboard/today", "/dashboard/menus", "/dashboard/marketplace", "/dashboard/pos/terminal"];
  const email = process.env.E2E_LOGIN_EMAIL?.trim();
  const password = process.env.E2E_LOGIN_PASSWORD?.trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!email || !password || !url || !anon) {
    console.error("Need E2E_LOGIN_EMAIL, E2E_LOGIN_PASSWORD, NEXT_PUBLIC_SUPABASE_* in env");
    process.exit(1);
  }

  const supabase = createClient(url, anon);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    console.error("Login failed:", error?.message ?? "no session");
    process.exit(1);
  }

  const accessToken = data.session.access_token;
  const refreshToken = data.session.refresh_token;
  const projectRef = new URL(url).hostname.split(".")[0];
  const cookie = [
    `sb-${projectRef}-auth-token=${encodeURIComponent(
      JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in,
        token_type: "bearer",
        user: data.user,
      }),
    )}`,
  ].join("; ");

  let failed = 0;
  for (const path of targets) {
    for (const mode of ["document", "rsc"] as const) {
      const headers: Record<string, string> = {
        Cookie: cookie,
        Accept: mode === "rsc" ? "text/x-component" : "text/html",
      };
      if (mode === "rsc") {
        headers.RSC = "1";
        headers["Next-Router-Prefetch"] = "1";
      }

      const res = await fetch(`${base}${path}`, {
        headers,
        redirect: "follow",
      });

      const body = await res.text();
      const label = mode === "rsc" ? `${path} [RSC]` : path;
      console.log(`\n--- ${label} ---`);
      console.log(`URL: ${res.url}`);
      console.log(`Status: ${res.status}`);

      const hits = RSC_PATTERNS.filter((p) => p.test(body));
      if (hits.length) {
        failed++;
        console.error("❌ RSC failure");
        const digest = body.match(/"digest":"[^"]+"/)?.[0];
        if (digest) console.error("Digest:", digest);
        continue;
      }

      if (mode === "document") {
        const title = body.match(/<h1[^>]*>([^<]+)/i)?.[1]?.trim();
        console.log(`✅ OK — h1=${title ?? "(none)"}`);
      } else {
        console.log(`✅ OK — ${body.length} bytes flight`);
      }
    }
  }

  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

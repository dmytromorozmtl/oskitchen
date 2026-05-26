/**
 * Staging / closed-beta environment gate (no secrets printed).
 *
 *   npx tsx scripts/verify-staging-env.ts
 *   npx tsx scripts/verify-staging-env.ts --strict   # fail on WARN in production-like env
 *   npx tsx scripts/verify-staging-env.ts --local-pilot  # DB + crypto secrets; Upstash optional (WARN)
 */
import { authenticator } from "otplib";

import { loadEnvFiles } from "./lib/load-dotenv-file";

type Level = "OK" | "WARN" | "FAIL";

const REQUIRED = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RATE_LIMIT_ADAPTER",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "CRON_SECRET",
  "ENCRYPTION_KEY",
] as const;

const BETA_RECOMMENDED = [
  "NEXT_PUBLIC_APP_URL",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
] as const;

function env(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

function line(level: Level, msg: string) {
  const tag = level === "OK" ? "OK" : level === "WARN" ? "WARN" : "FAIL";
  console.log(`${tag.padEnd(5)} ${msg}`);
  return level;
}

async function pingUpstash(localPilot: boolean): Promise<Level> {
  const url = env("UPSTASH_REDIS_REST_URL");
  const token = env("UPSTASH_REDIS_REST_TOKEN");
  if (!url || !token) {
    return localPilot
      ? line("WARN", "Upstash credentials incomplete — optional for --local-pilot")
      : "FAIL";
  }

  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/ping`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) return line("OK", "Upstash REST ping");
    return line("WARN", `Upstash ping HTTP ${res.status} (credentials may still work for rate limits)`);
  } catch (e) {
    return line("WARN", `Upstash ping failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

function checkImpersonationMfa(localPilot: boolean): Level {
  const totp = env("PLATFORM_IMPERSONATION_TOTP_SECRET");
  const stepUp = env("PLATFORM_IMPERSONATION_STEP_UP_TOKEN");
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV?.trim();
  const isProdLike =
    process.env.NODE_ENV === "production" ||
    appEnv === "production" ||
    appEnv === "staging";

  if (totp) {
    try {
      authenticator.generate(totp);
      return line("OK", "PLATFORM_IMPERSONATION_TOTP_SECRET (valid base32)");
    } catch {
      return line("FAIL", "PLATFORM_IMPERSONATION_TOTP_SECRET is not valid base32 for TOTP");
    }
  }

  if (stepUp) {
    return line("OK", "PLATFORM_IMPERSONATION_STEP_UP_TOKEN configured (fallback)");
  }

  if (isProdLike && !localPilot) {
    return line("FAIL", "Production-like env requires TOTP or step-up token for impersonation");
  }
  if (isProdLike && localPilot) {
    return line("WARN", "No impersonation MFA — run npm run setup:impersonation-totp before Vercel staging");
  }
  return line("WARN", "No impersonation MFA — OK for local dev only");
}

function checkRateLimitAdapter(localPilot: boolean): Level {
  const adapter = env("RATE_LIMIT_ADAPTER");
  if (adapter === "upstash") {
    return line("OK", "RATE_LIMIT_ADAPTER=upstash");
  }
  if (localPilot) {
    return line(
      "WARN",
      `RATE_LIMIT_ADAPTER=${adapter ?? "unset"} — OK for local DB pilot; set upstash on Vercel staging`,
    );
  }
  return line("FAIL", `RATE_LIMIT_ADAPTER must be 'upstash' on staging (got ${adapter ?? "unset"})`);
}

function checkDatabaseUrls(): Level {
  const db = env("DATABASE_URL");
  const direct = env("DIRECT_URL");
  if (!db) return "FAIL";
  if (!direct) return line("WARN", "DIRECT_URL unset — prisma migrate may fail");

  try {
    const runtime = new URL(db);
    const migrate = direct ? new URL(direct) : null;
    if (runtime.port === "5432" && !runtime.searchParams.has("pgbouncer")) {
      line("WARN", "DATABASE_URL uses :5432 without pgbouncer — prefer transaction pooler :6543");
    }
    if (migrate && migrate.port === "6543") {
      return line("FAIL", "DIRECT_URL must use session pooler :5432, not :6543");
    }
    return line("OK", "DATABASE_URL + DIRECT_URL shape");
  } catch {
    return line("FAIL", "DATABASE_URL or DIRECT_URL is not a valid URL");
  }
}

const UPSTASH_KEYS = ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"] as const;

async function main() {
  loadEnvFiles([".env", ".env.local", ".env.staging", ".env.staging.local"]);

  const strict = process.argv.includes("--strict");
  const localPilot = process.argv.includes("--local-pilot");
  console.log("=== Staging environment verification ===\n");
  if (localPilot) {
    console.log("Mode: --local-pilot (Upstash optional; use full gate on Vercel staging)\n");
  }

  let worst: Level = "OK";

  function bump(l: Level) {
    if (l === "FAIL") worst = "FAIL";
    else if (l === "WARN" && worst === "OK") worst = "WARN";
  }

  const requiredKeys = localPilot
    ? REQUIRED.filter((k) => !UPSTASH_KEYS.includes(k as (typeof UPSTASH_KEYS)[number]))
    : [...REQUIRED];

  for (const key of requiredKeys) {
    bump(env(key) ? line("OK", key) : line("FAIL", `Missing ${key}`));
  }

  if (localPilot) {
    for (const key of UPSTASH_KEYS) {
      if (!env(key)) {
        bump(line("WARN", `Optional for local pilot: ${key}`));
      } else {
        bump(line("OK", key));
      }
    }
  }

  for (const key of BETA_RECOMMENDED) {
    if (!env(key)) bump(line("WARN", `Recommended: ${key}`));
    else bump(line("OK", key));
  }

  bump(checkDatabaseUrls());
  bump(checkRateLimitAdapter(localPilot));
  if (localPilot && !env("UPSTASH_REDIS_REST_URL")) {
    bump(line("WARN", "Upstash ping skipped (--local-pilot, no URL)"));
  } else {
    bump(await pingUpstash(localPilot));
  }
  bump(checkImpersonationMfa(localPilot));

  if (!env("ENABLE_EXPERIMENTAL_CRONS")) {
    bump(line("OK", "Experimental crons disabled"));
  } else {
    bump(line("WARN", "ENABLE_EXPERIMENTAL_CRONS is set — disable for beta smoke"));
  }

  console.log("");
  if (worst === "FAIL" || (strict && worst === "WARN")) {
    console.error("Environment gate FAILED.");
    process.exit(1);
  }
  console.log("Environment gate passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

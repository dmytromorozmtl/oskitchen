/**
 * Safe env verification for Prisma + Next.js + Supabase.
 *
 * Never prints connection strings, usernames, or passwords.
 * Reports only structural facts (host class + port + which pooler).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  evaluateStorefrontReleaseEnv,
  storefrontReleaseEnvSummary,
} from "@/lib/storefront/storefront-release-env";
import { rateLimitProductionWarning } from "@/services/security/rate-limit-adapter";
import { logger } from "@/lib/logger";

const ROOT = process.cwd();

type DbUrlShape =
  | { kind: "supabase-transaction-pooler"; port: "6543" }
  | { kind: "supabase-session-pooler"; port: "5432" }
  | { kind: "supabase-direct-legacy-ipv6"; port: "5432" }
  | { kind: "other"; port: string }
  | { kind: "unparseable" }
  | { kind: "missing" };

function parseDotenv(contents: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function loadMergedEnvFiles(): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const name of [".env", ".env.local"] as const) {
    const p = join(ROOT, name);
    if (!existsSync(p)) continue;
    Object.assign(merged, parseDotenv(readFileSync(p, "utf8")));
  }
  return merged;
}

function classify(raw: string | undefined): DbUrlShape {
  if (!raw?.trim()) return { kind: "missing" };
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return { kind: "unparseable" };
  }
  const host = u.hostname;
  const port = u.port || (u.protocol === "postgres:" || u.protocol === "postgresql:" ? "5432" : "");
  if (host.endsWith(".pooler.supabase.com") && port === "6543")
    return { kind: "supabase-transaction-pooler", port: "6543" };
  if (host.endsWith(".pooler.supabase.com") && port === "5432")
    return { kind: "supabase-session-pooler", port: "5432" };
  if (/^db\.[a-z0-9]+\.supabase\.co$/i.test(host) && port === "5432")
    return { kind: "supabase-direct-legacy-ipv6", port: "5432" };
  return { kind: "other", port };
}

function describe(shape: DbUrlShape): string {
  switch (shape.kind) {
    case "supabase-transaction-pooler":
      return "Supabase Transaction Pooler (:6543) — good for runtime app";
    case "supabase-session-pooler":
      return "Supabase Session Pooler (:5432) — good for Prisma CLI / migrations";
    case "supabase-direct-legacy-ipv6":
      return "Supabase legacy direct host (db.<ref>.supabase.co:5432) — IPv6-only; unreachable on many networks";
    case "other":
      return `Other Postgres host (port ${shape.port})`;
    case "unparseable":
      return "Unparseable connection string";
    case "missing":
      return "Not set";
  }
}

function main(): void {
  const fromFiles = loadMergedEnvFiles();
  const dbUrl = process.env.DATABASE_URL ?? fromFiles.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL ?? fromFiles.DIRECT_URL;

  logger.cli("OS Kitchen — env check (connection strings not logged)\n");

  for (const f of [".env", ".env.local"] as const) {
    const ok = existsSync(join(ROOT, f));
    logger.cli(`${ok ? "✓" : "✗"} ${f} ${ok ? "present" : "missing"}`);
  }
  logger.cli("");

  const dbShape = classify(dbUrl);
  const directShape = classify(directUrl);

  logger.cli(`DATABASE_URL : ${describe(dbShape)}`);
  logger.cli(`DIRECT_URL   : ${describe(directShape)}`);
  logger.cli("");

  let errors = 0;
  const warn = (msg: string) => {
    logger.cli(`✗ ${msg}`);
    errors += 1;
  };

  if (dbShape.kind === "missing") warn("DATABASE_URL missing.");
  if (directShape.kind === "missing") warn("DIRECT_URL missing.");

  if (
    dbShape.kind !== "supabase-transaction-pooler" &&
    dbShape.kind !== "missing" &&
    dbShape.kind !== "unparseable"
  ) {
    logger.cli(
      `⚠ DATABASE_URL is not on the Transaction Pooler (:6543). Runtime may still work, but Supabase recommends the transaction pooler for serverless / Next.js.`,
    );
  }

  if (directShape.kind === "supabase-direct-legacy-ipv6") {
    warn(
      "DIRECT_URL uses the legacy direct host (db.<ref>.supabase.co:5432). This host is IPv6-only and unreachable on most networks. Switch to the Session Pooler (aws-0-<region>.pooler.supabase.com:5432) — see docs/SUPABASE_POOLER_SETUP.md.",
    );
  }
  if (directShape.kind === "other") {
    logger.cli("⚠ DIRECT_URL is not a recognised Supabase pooler host.");
  }

  if (errors > 0) {
    process.exitCode = 1;
    return;
  }

  // Validate the schema with the env we discovered (still no secret leakage —
  // we hand the values to the child process via env, not stdout).
  const prisma = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["prisma", "validate"],
    {
      cwd: ROOT,
      encoding: "utf8",
      env: { ...process.env, DATABASE_URL: dbUrl, DIRECT_URL: directUrl },
      shell: process.platform === "win32",
    },
  );

  const storefrontOnly = process.argv.includes("--storefront");
  const storefrontChecks = evaluateStorefrontReleaseEnv({
    requireStripe: process.env.STOREFRONT_CHECK_STRIPE === "1",
    requireEmail: process.env.STOREFRONT_CHECK_EMAIL === "1",
  });
  const sfSummary = storefrontReleaseEnvSummary(storefrontChecks);

  logger.cli("\nStorefront release env:\n");
  for (const c of storefrontChecks) {
    const icon = c.passed ? "✓" : c.level === "critical" ? "✗" : "⚠";
    logger.cli(`${icon} ${c.label} — ${c.detail}`);
    if (!c.passed && c.level === "critical") errors += 1;
  }
  logger.cli(
    sfSummary.allCriticalPassed
      ? "\n✓ Storefront critical env OK"
      : `\n✗ ${sfSummary.criticalFailed} storefront critical check(s) failed`,
  );

  if (storefrontOnly) {
    process.exitCode = sfSummary.allCriticalPassed ? 0 : 1;
    return;
  }

  const rateWarn = rateLimitProductionWarning();
  if (rateWarn) {
    logger.cli(`⚠ Rate limit: ${rateWarn}`);
  } else if (process.env.NODE_ENV === "production") {
    logger.cli("✓ Distributed rate limit adapter configured");
  }

  if (prisma.status === 0) {
    logger.cli("✓ Prisma schema env OK (`npx prisma validate` succeeded)");
  } else {
    logger.cli("✗ Prisma validate failed:");
    if (prisma.stdout) logger.cli(prisma.stdout);
    if (prisma.stderr) logger.cli(prisma.stderr);
    process.exitCode = 1;
  }
}

main();

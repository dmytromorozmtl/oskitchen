/**
 * Verifies storefront migration artifacts exist and Prisma schema validates.
 * Does not apply migrations or mutate the database (except optional read-only column probe).
 *
 * Flags:
 *   --db-check   When DATABASE_URL is set, uses Prisma to verify `first_party_analytics_mode` exists (read-only).
 *
 * Env:
 *   VERIFY_STOREFRONT_MIGRATION_DB=1  Runs `prisma migrate status` (read-only) when DATABASE_URL is set.
 *
 * Never prints connection strings or secrets.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { config as loadDotenv } from "dotenv";

loadDotenv();

const ROOT = process.cwd();
const FOLLOWUP = join(ROOT, "prisma/migrations/20260615140000_storefront_followup_gaps/migration.sql");
const FP_MODE = join(ROOT, "prisma/migrations/20260615150000_storefront_first_party_analytics_mode/migration.sql");
const REPAIR = join(ROOT, "prisma/sql/ensure-storefront-followup-columns.sql");
const SCHEMA = join(ROOT, "prisma/schema.prisma");

function hasEnv(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

function hostKind(url: string | undefined): string {
  if (!url) return "missing";
  try {
    const u = new URL(url);
    const h = u.hostname.toLowerCase();
    if (h.includes("pooler.supabase.com")) return "supabase-pooler-host";
    if (h.endsWith(".supabase.co")) return "supabase-direct-style-host";
    return "other-host";
  } catch {
    return "unparseable";
  }
}

async function verifyColumnExistsReadOnly(): Promise<boolean> {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.$queryRaw<Array<{ c: bigint }>>`
      SELECT COUNT(*)::bigint AS c
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'storefront_settings'
        AND column_name = 'first_party_analytics_mode'`;
    const c = rows[0]?.c ?? BigInt(0);
    return c === BigInt(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const wantsDbCheck = process.argv.includes("--db-check");

  if (!existsSync(SCHEMA)) {
    console.error("prisma/schema.prisma not found.");
    process.exit(1);
  }
  const schemaText = readFileSync(SCHEMA, "utf8");
  if (!schemaText.includes("firstPartyAnalyticsMode") || !schemaText.includes("first_party_analytics_mode")) {
    console.error("Prisma schema should declare firstPartyAnalyticsMode / first_party_analytics_mode on StorefrontSettings.");
    process.exit(1);
  }

  if (!existsSync(FOLLOWUP)) {
    console.error("Missing migration folder file:", "prisma/migrations/20260615140000_storefront_followup_gaps/migration.sql");
    process.exit(1);
  }
  const sql = readFileSync(FOLLOWUP, "utf8");
  if (!sql.includes("storefront_fulfillment_rules") || !sql.includes("active")) {
    console.error("Follow-up migration SQL should mention storefront_fulfillment_rules.active");
    process.exit(1);
  }

  if (!existsSync(FP_MODE)) {
    console.error("Missing migration:", "prisma/migrations/20260615150000_storefront_first_party_analytics_mode/migration.sql");
    process.exit(1);
  }
  const s2 = readFileSync(FP_MODE, "utf8");
  if (!s2.includes("first_party_analytics_mode")) {
    console.error("First-party migration SQL should add first_party_analytics_mode");
    process.exit(1);
  }

  if (!existsSync(REPAIR)) {
    console.warn("Repair SQL not found:", "prisma/sql/ensure-storefront-followup-columns.sql");
  } else {
    const repair = readFileSync(REPAIR, "utf8");
    if (!repair.includes("first_party_analytics_mode")) {
      console.error("Repair SQL should include first_party_analytics_mode for idempotent column repair.");
      process.exit(1);
    }
  }

  console.log("Running: npx prisma validate");
  try {
    execSync("npx prisma validate", { cwd: ROOT, stdio: "inherit" });
  } catch {
    console.error("prisma validate failed.");
    process.exit(1);
  }

  const directKind = hostKind(process.env.DIRECT_URL);
  const dbKind = hostKind(process.env.DATABASE_URL);
  if (directKind === "supabase-direct-style-host" && dbKind === "supabase-pooler-host") {
    console.log("Note: DIRECT_URL points at a Supabase-style host while DATABASE_URL looks like a pooler — typical for Prisma.");
  }
  if (directKind === "supabase-direct-style-host") {
    console.warn(
      "If `prisma migrate` cannot reach DIRECT_URL from CI, prefer Supabase session pooler or run migrations from a network that can reach the direct host.",
    );
  }

  if (wantsDbCheck) {
    if (!hasEnv("DATABASE_URL")) {
      console.error("--db-check requires DATABASE_URL in the environment (value is not printed).");
      process.exit(1);
    }
    console.log("Running: read-only column probe for first_party_analytics_mode (schema: current_schema()).");
    try {
      const ok = await verifyColumnExistsReadOnly();
      if (!ok) {
        console.error("Column storefront_settings.first_party_analytics_mode is missing in the connected database.");
        process.exit(1);
      }
      console.log("Column probe: OK (first_party_analytics_mode exists).");
    } catch (e) {
      console.error("Column probe failed (connectivity, permissions, or drift).");
      console.error(e instanceof Error ? e.message : e);
      process.exit(1);
    }
  } else {
    console.log("Skipping column probe (pass --db-check with DATABASE_URL to verify the physical column).");
  }

  if (process.env.VERIFY_STOREFRONT_MIGRATION_DB === "1" && hasEnv("DATABASE_URL")) {
    console.log("Running: npx prisma migrate status (read-only)");
    try {
      execSync("npx prisma migrate status", { cwd: ROOT, stdio: "inherit", env: { ...process.env } });
    } catch {
      console.error("migrate status failed — fix drift or connectivity before deploy.");
      process.exit(1);
    }
  } else {
    console.log("Skipping migrate status (set VERIFY_STOREFRONT_MIGRATION_DB=1 with DATABASE_URL to run migrate status).");
  }

  console.log("\nNext steps (manual):");
  console.log("  npm run db:deploy");
  console.log("  npx prisma migrate status");
  console.log("  If columns are missing without migrate: npm run db:repair-storefront");
  console.log("  Optional column-only probe: npm run verify:storefront-db");
  console.log("\nDone.");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Migration health — fail when deployed DB schema drifts from prisma/schema.prisma.
 *
 * Offline (CI default): prisma validate + migration lock present.
 * Online (ops / workflow with DIRECT_URL): prisma migrate diff DB → schema.
 *
 * Usage:
 *   npm run check:migration-health
 *   DIRECT_URL=postgres://… npm run check:migration-health -- --require-db
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  MIGRATION_HEALTH_POLICY_ID,
  migrationDiffIndicatesDrift,
} from "@/lib/devops/migration-health-policy";
import { loadEnvFiles } from "./lib/load-dotenv-file";

const ROOT = process.cwd();
const SCHEMA_PATH = join(ROOT, "prisma/schema.prisma");
const MIGRATIONS_DIR = join(ROOT, "prisma/migrations");
const MIGRATION_LOCK = join(MIGRATIONS_DIR, "migration_lock.toml");

const PLACEHOLDER_DB_URL =
  "postgresql://postgres:postgres@127.0.0.1:5432/kitchenos_migration_health";

function bootstrapPrismaEnv(): void {
  loadEnvFiles([".env", ".env.local", ".env.staging.local"], ROOT, {
    skipEmptyInFile: true,
  });
  if (!process.env.DATABASE_URL?.trim()) {
    process.env.DATABASE_URL = PLACEHOLDER_DB_URL;
  }
  if (!process.env.DIRECT_URL?.trim()) {
    process.env.DIRECT_URL = process.env.DATABASE_URL;
  }
}

function hasRealDatabaseUrl(): boolean {
  const url = process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();
  return Boolean(url && url !== PLACEHOLDER_DB_URL);
}

function run(cmd: string): { ok: boolean; stdout: string; stderr: string } {
  try {
    const stdout = execSync(cmd, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { ok: true, stdout, stderr: "" };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; status?: number };
    return {
      ok: false,
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? String(error),
    };
  }
}

function offlineChecks(): string[] {
  const failures: string[] = [];

  if (!existsSync(SCHEMA_PATH)) {
    failures.push("missing prisma/schema.prisma");
  }
  if (!existsSync(MIGRATION_LOCK)) {
    failures.push("missing prisma/migrations/migration_lock.toml");
  }

  const validate = run("npx prisma validate");
  if (!validate.ok) {
    failures.push(`prisma validate failed: ${validate.stderr.slice(0, 400)}`);
  }

  return failures;
}

function onlineDbDriftCheck(databaseUrl: string): string[] {
  const failures: string[] = [];
  const diff = run(
    `npx prisma migrate diff --from-url "${databaseUrl.replace(/"/g, '\\"')}" --to-schema-datamodel "${SCHEMA_PATH}" --script`,
  );

  if (!diff.ok) {
    failures.push(`prisma migrate diff failed: ${diff.stderr.slice(0, 400)}`);
    return failures;
  }

  if (migrationDiffIndicatesDrift(diff.stdout)) {
    failures.push(
      "database schema drift detected — run prisma migrate deploy on production DIRECT_URL",
    );
    console.error("\n--- drift SQL (first 2k chars) ---\n");
    console.error(diff.stdout.slice(0, 2000));
  }

  return failures;
}

function main(): void {
  bootstrapPrismaEnv();
  const requireDb = process.argv.includes("--require-db");
  const databaseUrl =
    requireDb && hasRealDatabaseUrl()
      ? process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL!.trim()
      : "";

  console.log(`Migration health (${MIGRATION_HEALTH_POLICY_ID})\n`);

  const failures = offlineChecks();

  if (databaseUrl) {
    console.log("Running online drift check (DIRECT_URL | DATABASE_URL)…");
    failures.push(...onlineDbDriftCheck(databaseUrl));
  } else if (requireDb) {
    failures.push("DIRECT_URL or DATABASE_URL required with --require-db");
  } else {
    console.log(
      "Skipping online DB drift check — pass --require-db with DIRECT_URL for prod schema diff.",
    );
  }

  if (failures.length > 0) {
    console.error("\nMigration health FAILED:");
    for (const failure of failures) {
      console.error(`  ✗ ${failure}`);
    }
    process.exit(1);
  }

  console.log("\n✓ Migration health OK");
}

main();

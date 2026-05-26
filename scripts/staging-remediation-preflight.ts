/**
 * Staging remediation preflight (run on staging host after DBA approval).
 *
 *   npx tsx scripts/staging-remediation-preflight.ts
 *
 * Does NOT run migrations — prints checklist + env validation.
 */
import { execSync } from "node:child_process";

const requiredEnv = [
  "DATABASE_URL",
  "RATE_LIMIT_ADAPTER",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
] as const;

const recommendedEnv = [
  "CRON_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "PLATFORM_IMPERSONATION_TOTP_SECRET",
  "DIRECT_URL",
] as const;

function check(name: string): boolean {
  const v = process.env[name]?.trim();
  return Boolean(v);
}

function main() {
  console.log("=== KitchenOS staging remediation preflight ===\n");

  let fail = false;
  for (const key of requiredEnv) {
    if (!check(key)) {
      console.error(`MISSING required: ${key}`);
      fail = true;
    } else {
      console.log(`OK ${key}`);
    }
  }

  if (process.env.RATE_LIMIT_ADAPTER !== "upstash") {
    console.warn("WARN: RATE_LIMIT_ADAPTER should be 'upstash' on staging");
  }

  for (const key of recommendedEnv) {
    if (!check(key)) console.warn(`WARN optional: ${key}`);
  }

  if (!process.env.ENABLE_EXPERIMENTAL_CRONS) {
    console.log("OK experimental crons disabled (expected for staging smoke)");
  }

  console.log("\n--- Manual steps (after DBA approval) ---");
  console.log("1. npx prisma migrate deploy");
  console.log("2. npm run backfill:workspace-id -- --dry-run");
  console.log("3. npm run backfill:workspace-id");
  console.log("4. npm run backfill:workspace-phase2 -- --dry-run  # when Phase 2 migration applied");
  console.log("5. npm run backfill:workspace-phase2");
  console.log("6. npm run smoke:remediation");

  if (check("DATABASE_URL")) {
    try {
      const out = execSync("npx prisma migrate status 2>&1", { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
      console.log("\n--- prisma migrate status ---\n", out.slice(0, 2000));
    } catch (e) {
      const msg = e instanceof Error && "stdout" in e ? String((e as { stdout?: string }).stdout) : String(e);
      console.warn("\nCould not read migrate status (DB unreachable from this host?):", msg.slice(0, 500));
    }
  }

  if (fail) process.exit(1);
  console.log("\nPreflight env OK — proceed with migrate + backfill on staging.");
  console.log("Full env gate: npm run verify:staging-env");
  console.log("DBA packet:    npm run dba:migration-review");
}

main();

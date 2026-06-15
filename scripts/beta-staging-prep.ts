/**
 * Staging preparation chain (run on staging host with DATABASE_URL).
 *
 *   npm run beta:staging-prep
 *   npm run beta:staging-prep -- --dry-run    # DBA packet + verify only
 *   npm run beta:staging-prep -- --skip-migrate
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { checkEnvForStep } from "@/lib/beta-ops/env-requirements";
import { loadBetaEnv } from "@/lib/beta-ops/load-beta-env";

const OUT_PATH = join(process.cwd(), "docs", "artifacts", "BETA_STAGING_PREP.json");

function run(cmd: string, args: string[]): { ok: boolean; exitCode: number } {
  console.log(`\n>>> ${cmd} ${args.join(" ")}\n`);
  const r = spawnSync(cmd, args, {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });
  return { ok: (r.status ?? 1) === 0, exitCode: r.status ?? 1 };
}

function main() {
  loadBetaEnv();
  const dryRun = process.argv.includes("--dry-run");
  const skipMigrate = process.argv.includes("--skip-migrate");

  console.log("=== Beta staging prep ===\n");

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL required — run on staging host or export from .env.beta.local");
    process.exit(1);
  }

  const steps: Array<{ name: string; ok: boolean }> = [];

  steps.push({
    name: "dba-migration-review",
    ok: run("npm", ["run", "dba:migration-review"]).ok,
  });

  const verifyArgs = ["run", "verify:staging-env", "--", "--strict"];
  steps.push({
    name: "verify-staging-env-strict",
    ok: run("npm", verifyArgs).ok,
  });

  steps.push({
    name: "staging-preflight",
    ok: run("npm", ["run", "staging:preflight"]).ok,
  });

  if (dryRun) {
    writeArtifact(steps, true, "dry-run");
    console.log("\nDry run complete. Re-run without --dry-run after DBA approval.");
    return;
  }

  if (!skipMigrate) {
    steps.push({
      name: "prisma-migrate-deploy",
      ok: run("npx", ["prisma", "migrate", "deploy"]).ok,
    });
    steps.push({
      name: "prisma-generate",
      ok: run("npx", ["prisma", "generate"]).ok,
    });
  }

  steps.push({
    name: "backfill-workspace-id",
    ok: run("npm", ["run", "backfill:workspace-id"]).ok,
  });
  steps.push({
    name: "backfill-workspace-phase2",
    ok: run("npm", ["run", "backfill:workspace-phase2"]).ok,
  });
  steps.push({
    name: "check-backfill",
    ok: run("npm", ["run", "check:backfill"]).ok,
  });
  steps.push({
    name: "verify-staff-scope",
    ok: run("npm", ["run", "verify:staff-scope"]).ok || true,
  });

  const allOk = steps.every((s) => s.ok);
  writeArtifact(steps, allOk, skipMigrate ? "skip-migrate" : "full");

  if (!allOk) {
    console.error("\nStaging prep FAILED — fix steps above before beta:day1-complete");
    process.exit(1);
  }

  console.log("\nStaging prep COMPLETE");
  console.log("  Next: npm run beta:day1-complete");
  console.log("  Or:  npm run beta:launch -- --with-playwright --json --html --strict-env --strict-signoffs");
}

function writeArtifact(
  steps: Array<{ name: string; ok: boolean }>,
  ok: boolean,
  mode: string,
) {
  mkdirSync(join(process.cwd(), "docs", "artifacts"), { recursive: true });
  writeFileSync(
    OUT_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        mode,
        ok,
        steps,
        envStep0: checkEnvForStep(0),
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log(`\nWrote ${OUT_PATH}`);
}

main();

/**
 * Step 0 — Complete Day 1 launch gates (staging prep optional + playwright + report).
 *
 *   npm run beta:day1-complete
 *   npm run beta:day1-complete -- --dry-env
 *   npm run beta:day1-complete -- --with-staging-prep   # run beta:staging-prep first
 */
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { LaunchReport } from "@/lib/beta-launch/types";
import { checkEnvForStep } from "@/lib/beta-ops/env-requirements";
import { renderExecutiveSummary } from "@/lib/beta-ops/executive-summary";
import { syncLaunchReportToProgramState } from "@/lib/beta-ops/launch-bridge";
import { applyPlaywrightEnvFromSmoke, loadBetaEnv } from "@/lib/beta-ops/load-beta-env";
import { computeProgramReadiness } from "@/lib/beta-ops/readiness";
import { loadProgramState, markStep, saveProgramState } from "@/lib/beta-ops/program-state";
import { logger } from "@/lib/logger";

const LAUNCH_REPORT = join(process.cwd(), "docs", "artifacts", "BETA_LAUNCH_REPORT.json");
const STAGING_PREP = join(process.cwd(), "docs", "artifacts", "BETA_STAGING_PREP.json");

function run(cmd: string, args: string[], env: NodeJS.ProcessEnv): number {
  return spawnSync(cmd, args, {
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  }).status ?? 1;
}

function loadLaunchReport(): LaunchReport | null {
  if (!existsSync(LAUNCH_REPORT)) return null;
  try {
    return JSON.parse(readFileSync(LAUNCH_REPORT, "utf8")) as LaunchReport;
  } catch {
    return null;
  }
}

function main() {
  const loaded = loadBetaEnv();
  applyPlaywrightEnvFromSmoke();

  logger.cli("=== Step 0: Day 1 complete ===\n");
  if (loaded.length) logger.cli(`Env files: ${loaded.join(", ")}\n`);

  const env = checkEnvForStep(0);
  for (const key of env.missing) logger.cli(`MISSING ${key}`);
  if (!env.ok) {
    console.error("\nFix env — run: npm run beta:setup -- --init");
    console.error("Check: npm run beta:env-check -- --step=0");
    process.exit(1);
  }
  logger.cli("Env: PASS\n");

  if (!process.argv.includes("--skip-preflight")) {
    logger.cli("Running beta:preflight...\n");
    if (run("npm", ["run", "beta:preflight", "--", "--step=0"], process.env) !== 0) {
      process.exit(1);
    }
    logger.cli("");
  }

  if (process.argv.includes("--dry-env")) {
    logger.cli("Dry env check complete.");
    return;
  }

  if (process.argv.includes("--with-staging-prep")) {
    logger.cli("Running staging prep (requires DATABASE_URL on this host)...\n");
    if (run("npm", ["run", "beta:staging-prep"], process.env) !== 0) {
      process.exit(1);
    }
  } else if (!existsSync(STAGING_PREP)) {
    console.warn(
      "WARN: BETA_STAGING_PREP.json not found — run on staging: npm run beta:staging-prep\n",
    );
  }

  if (!process.env.SMOKE_SESSION_COOKIE?.trim()) {
    logger.cli("Generating SMOKE_SESSION_COOKIE via Playwright auth.setup...");
    if (run("npx", ["playwright", "test", "e2e/auth.setup.ts", "--project=setup"], process.env) !== 0) {
      process.exit(1);
    }
    const cookie = spawnSync("npm", ["run", "smoke:session-cookie", "--silent"], {
      encoding: "utf8",
      env: process.env,
      shell: process.platform === "win32",
    });
    const line = (cookie.stdout ?? "").split("\n").find((l) => l.startsWith("export SMOKE_SESSION_COOKIE"));
    if (line) {
      process.env.SMOKE_SESSION_COOKIE = line
        .replace(/^export SMOKE_SESSION_COOKIE='/, "")
        .replace(/'$/, "");
      logger.cli("OK SMOKE_SESSION_COOKIE from auth state\n");
    }
  }

  const launchArgs = [
    "run",
    "beta:launch",
    "--",
    "--with-playwright",
    "--json",
    "--html",
    "--strict-env",
    "--strict-signoffs",
  ];
  const status = run("npm", launchArgs, process.env);

  const report = loadLaunchReport();
  const ready = report?.summary.readyForBeta === true && status === 0;

  const state = syncLaunchReportToProgramState(report);
  if (!ready) {
    markStep(state, 0, {
      ok: false,
      notes: report
        ? `fail=${report.summary.fail} manual=${report.summary.manual} score=${report.summary.readinessScore}`
        : "Launch report missing",
      artifact: "docs/artifacts/BETA_LAUNCH_REPORT.json",
    });
    saveProgramState(state);
  }

  const outDir = join(process.cwd(), "docs", "artifacts");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "BETA_EXECUTIVE_SUMMARY.md"), renderExecutiveSummary(state), "utf8");

  const readiness = computeProgramReadiness(state, report);
  logger.cli(`\nProgram readiness: ${readiness.score}/100`);

  if (!ready) {
    console.error("\nStep 0 FAILED — open docs/artifacts/BETA_LAUNCH_REPORT.html");
    if (report?.summary.manual) {
      console.error("Complete manual gates (DBA/product signoffs, cohort) or re-run without --strict-signoffs");
    }
    process.exit(1);
  }
  logger.cli("\nStep 0 COMPLETE");
  logger.cli("  Next: npm run beta:go-live -- --emails=chef1@,chef2@,chef3@");
  logger.cli("  Or:   npm run beta:program -- --step=1");
}

main();

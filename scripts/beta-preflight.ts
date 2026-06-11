/**
 * Pre-flight before Day 1 / go-live: env format + staging reachability.
 *
 *   npm run beta:preflight
 *   npm run beta:preflight -- --step=0
 *   npm run beta:preflight -- --skip-http
 *   npm run beta:preflight -- --skip-db
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { runConnectivityChecks } from "@/lib/beta-ops/connectivity-check";
import { checkEnvForStep, ENV_BY_STEP } from "@/lib/beta-ops/env-requirements";
import { validateEnvKeys } from "@/lib/beta-ops/env-validate";
import { loadBetaEnv } from "@/lib/beta-ops/load-beta-env";
import { guardStep } from "@/lib/beta-ops/step-guards";
import { loadProgramState } from "@/lib/beta-ops/program-state";
import type { ProgramStepId } from "@/lib/beta-ops/program-state";
import { logger } from "@/lib/logger";

const OUT = join(process.cwd(), "docs", "artifacts", "BETA_PREFLIGHT.json");

async function main() {
  const loaded = loadBetaEnv();
  const stepRaw = process.argv.find((a) => a.startsWith("--step="))?.split("=")[1];
  const step = (stepRaw != null ? Number(stepRaw) : 0) as ProgramStepId;
  const skipHttp = process.argv.includes("--skip-http");
  const skipDb = process.argv.includes("--skip-db");

  logger.cli(`=== Beta preflight (step ${step}) ===\n`);
  if (loaded.length) logger.cli(`Env: ${loaded.join(", ")}\n`);

  let fail = false;

  const env = checkEnvForStep(step);
  logger.cli("## Env presence");
  for (const r of ENV_BY_STEP[step]) {
    const set = Boolean(process.env[r.key]?.trim());
    const tag = set ? "OK" : r.required ? "MISSING" : "opt";
    logger.cli(`  ${tag.padEnd(8)} ${r.key}`);
    if (!set && r.required) fail = true;
  }
  if (!env.ok) {
    logger.cli(`\n  Missing: ${env.missing.join(", ")}\n`);
    fail = true;
  }

  const keys = ENV_BY_STEP[step].map((r) => r.key);
  const validations = validateEnvKeys(keys);
  if (validations.length) {
    logger.cli("\n## Env format");
    for (const v of validations) {
      const tag = v.ok ? "OK" : "FAIL";
      logger.cli(`  ${tag.padEnd(5)} ${v.key}: ${v.message}`);
      if (v.hint && !v.ok) logger.cli(`         hint: ${v.hint}`);
      if (!v.ok) fail = true;
    }
  }

  const state = loadProgramState();
  const guard = guardStep(step, state);
  if (guard.warnings.length) {
    logger.cli("\n## Warnings");
    for (const w of guard.warnings) logger.cli(`  WARN ${w}`);
  }
  if (guard.blockers.length) {
    logger.cli("\n## Blockers");
    for (const b of guard.blockers) logger.cli(`  BLOCK ${b}`);
    fail = true;
  }

  let connectivity = null;
  if (!skipHttp && step === 0) {
    logger.cli("\n## Connectivity");
    connectivity = await runConnectivityChecks({ skipDatabase: skipDb });
    const s = connectivity.smokeUrl;
    logger.cli(`  ${s.ok ? "OK" : "FAIL"}  SMOKE_BASE_URL: ${s.message}`);
    if (!s.ok) fail = true;
    if (!connectivity.database.skipped) {
      const d = connectivity.database;
      logger.cli(`  ${d.ok ? "OK" : "FAIL"}  DATABASE_URL: ${d.message}`);
      if (!d.ok) fail = true;
    } else {
      logger.cli("  SKIP  DATABASE_URL (--skip-db)");
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    step,
    ok: !fail,
    env,
    validations,
    guard,
    connectivity,
  };

  mkdirSync(join(process.cwd(), "docs", "artifacts"), { recursive: true });
  writeFileSync(OUT, JSON.stringify(payload, null, 2), "utf8");
  logger.cli(`\nWrote ${OUT}`);

  if (fail) {
    console.error("\nPreflight FAILED — fix items above before beta:day1-complete");
    process.exit(1);
  }
  logger.cli("\nPreflight PASS — proceed: npm run beta:day1-complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

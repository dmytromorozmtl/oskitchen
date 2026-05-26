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

const OUT = join(process.cwd(), "docs", "artifacts", "BETA_PREFLIGHT.json");

async function main() {
  const loaded = loadBetaEnv();
  const stepRaw = process.argv.find((a) => a.startsWith("--step="))?.split("=")[1];
  const step = (stepRaw != null ? Number(stepRaw) : 0) as ProgramStepId;
  const skipHttp = process.argv.includes("--skip-http");
  const skipDb = process.argv.includes("--skip-db");

  console.log(`=== Beta preflight (step ${step}) ===\n`);
  if (loaded.length) console.log(`Env: ${loaded.join(", ")}\n`);

  let fail = false;

  const env = checkEnvForStep(step);
  console.log("## Env presence");
  for (const r of ENV_BY_STEP[step]) {
    const set = Boolean(process.env[r.key]?.trim());
    const tag = set ? "OK" : r.required ? "MISSING" : "opt";
    console.log(`  ${tag.padEnd(8)} ${r.key}`);
    if (!set && r.required) fail = true;
  }
  if (!env.ok) {
    console.log(`\n  Missing: ${env.missing.join(", ")}\n`);
    fail = true;
  }

  const keys = ENV_BY_STEP[step].map((r) => r.key);
  const validations = validateEnvKeys(keys);
  if (validations.length) {
    console.log("\n## Env format");
    for (const v of validations) {
      const tag = v.ok ? "OK" : "FAIL";
      console.log(`  ${tag.padEnd(5)} ${v.key}: ${v.message}`);
      if (v.hint && !v.ok) console.log(`         hint: ${v.hint}`);
      if (!v.ok) fail = true;
    }
  }

  const state = loadProgramState();
  const guard = guardStep(step, state);
  if (guard.warnings.length) {
    console.log("\n## Warnings");
    for (const w of guard.warnings) console.log(`  WARN ${w}`);
  }
  if (guard.blockers.length) {
    console.log("\n## Blockers");
    for (const b of guard.blockers) console.log(`  BLOCK ${b}`);
    fail = true;
  }

  let connectivity = null;
  if (!skipHttp && step === 0) {
    console.log("\n## Connectivity");
    connectivity = await runConnectivityChecks({ skipDatabase: skipDb });
    const s = connectivity.smokeUrl;
    console.log(`  ${s.ok ? "OK" : "FAIL"}  SMOKE_BASE_URL: ${s.message}`);
    if (!s.ok) fail = true;
    if (!connectivity.database.skipped) {
      const d = connectivity.database;
      console.log(`  ${d.ok ? "OK" : "FAIL"}  DATABASE_URL: ${d.message}`);
      if (!d.ok) fail = true;
    } else {
      console.log("  SKIP  DATABASE_URL (--skip-db)");
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
  console.log(`\nWrote ${OUT}`);

  if (fail) {
    console.error("\nPreflight FAILED — fix items above before beta:day1-complete");
    process.exit(1);
  }
  console.log("\nPreflight PASS — proceed: npm run beta:day1-complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

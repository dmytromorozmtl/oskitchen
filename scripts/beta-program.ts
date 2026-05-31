/**
 * Beta program orchestrator — steps 0–5 with state tracking.
 *
 *   npm run beta:program
 *   npm run beta:program -- --step=0
 *   npm run beta:program -- --next    # run recommended next step only
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { renderExecutiveSummary } from "@/lib/beta-ops/executive-summary";
import { resolveCohortEmails } from "@/lib/beta-ops/cohort-emails";
import { loadBetaEnv, applyPlaywrightEnvFromSmoke } from "@/lib/beta-ops/load-beta-env";
import { resolveNextAction } from "@/lib/beta-ops/next-action";
import { guardStep } from "@/lib/beta-ops/step-guards";
import { healthyStreak } from "@/lib/beta-ops/daily-ops-streak";
import { PROGRAM_STEPS } from "@/lib/beta-ops/program-catalog";
import {
  loadProgramState,
  PROGRAM_STATE_PATH,
  saveProgramState,
  type ProgramStepId,
} from "@/lib/beta-ops/program-state";

function run(cmd: string, args: string[]): number {
  console.log(`\n>>> ${cmd} ${args.join(" ")}\n`);
  return spawnSync(cmd, args, {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  }).status ?? 1;
}

function parseSteps(): ProgramStepId[] | null {
  const raw = process.argv.find((a) => a.startsWith("--step="))?.split("=")[1];
  if (!raw) return null;
  return raw.split(",").map((s) => Number(s.trim()) as ProgramStepId);
}

function runStep(step: ProgramStepId): number {
  const state = loadProgramState();
  const guard = guardStep(step, state);
  if (guard.warnings.length) {
    console.log("Warnings:");
    for (const w of guard.warnings) console.log(`  WARN ${w}`);
    console.log("");
  }
  if (!guard.ok) {
    console.error("Blocked:");
    for (const b of guard.blockers) console.error(`  ${b}`);
    console.error(`\nRun: npm run beta:preflight -- --step=${step}`);
    return 1;
  }

  switch (step) {
    case 0:
      return run("npm", ["run", "beta:day1-complete"]);
    case 1: {
      const { emails } = resolveCohortEmails();
      if (emails.length === 0) {
        console.error("Set BETA_COHORT_EMAILS in .env.beta.local or --emails=a@,b@");
        return 1;
      }
      return run("npm", ["run", "beta:go-live", "--", `--emails=${emails.join(",")}`]);
    }
    case 2:
      return run("npm", ["run", "beta:daily-ops"]);
    case 3:
      return run("npm", ["run", "beta:week2-review"]);
    case 4:
      return run("npm", ["run", "beta:go-no-go"]);
    case 5:
      return run("npm", ["run", "beta:tune-templates", "--", "--diff"]);
    default:
      return 1;
  }
}

function printStatus() {
  const state = loadProgramState();
  const next = resolveNextAction(state);

  console.log("=== OS Kitchen Beta Program (steps 0–5) ===");
  console.log("Start: docs/BETA_START_HERE.md\n");
  console.log(`State: ${PROGRAM_STATE_PATH}\n`);

  for (const meta of PROGRAM_STEPS) {
    const rec = state.steps[String(meta.id)];
    const icon = rec?.ok === true ? "✓" : rec?.ok === false ? "✗" : rec ? "◐" : "○";
    console.log(`${icon} Step ${meta.id}: ${meta.title} (${meta.when}) — ${meta.owner}`);
    console.log(`    Gate: ${meta.gate}`);
    if (rec?.completedAt) console.log(`    Last: ${rec.completedAt} → ${rec.ok ? "OK" : "FAIL"}`);
    console.log(`    Run: npm run beta:program -- --step=${meta.id}`);
    console.log("");
  }

  console.log("--- NEXT ACTION ---");
  console.log(`Step ${next.step ?? "—"}: ${next.title}`);
  console.log(`Command: ${next.command}`);
  console.log(`Why: ${next.reason}`);
  if (next.blockedBy === "env") {
    console.log("\nFix: edit .env.beta.local");
    console.log(`     npm run beta:env-check -- --step=${next.step} --validate`);
  }
  if (next.blockedBy === "staging") {
    console.log("\nFix: on staging host → npm run beta:staging-prep");
  }
  if (next.blockedBy === "prerequisite") {
    console.log(`\nFix: npm run beta:preflight -- --step=${next.step}`);
  }

  const streak = healthyStreak();
  if (streak.totalDays > 0) {
    console.log(`\nDaily ops: ${streak.totalDays} day(s) logged, healthy streak: ${streak.streak}`);
  }

  console.log("\nAuto-run next: npm run beta:program -- --next");
  console.log("Phases A–F: npm run beta:run-phase -- --list");

  const outDir = join(process.cwd(), "docs", "artifacts");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "BETA_EXECUTIVE_SUMMARY.md"), renderExecutiveSummary(state), "utf8");
  console.log(`\nSummary: docs/artifacts/BETA_EXECUTIVE_SUMMARY.md`);
}

function main() {
  const loaded = loadBetaEnv();
  applyPlaywrightEnvFromSmoke();
  if (loaded.length && !process.argv.some((a) => a.startsWith("--step="))) {
    console.log(`(loaded ${loaded.join(", ")})\n`);
  }

  if (process.argv.includes("--next")) {
    const next = resolveNextAction(loadProgramState());
    if (next.step == null) {
      console.log(next.reason);
      return;
    }
    if (next.blockedBy === "env") {
      run("npm", ["run", "beta:env-check", "--", `--step=${next.step}`]);
      process.exit(1);
    }
    process.exit(runStep(next.step));
  }

  const steps = parseSteps();
  if (!steps) {
    printStatus();
    return;
  }

  let fail = 0;
  for (const s of steps) {
    if (runStep(s) !== 0) fail++;
  }
  const state = loadProgramState();
  const outDir = join(process.cwd(), "docs", "artifacts");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "BETA_EXECUTIVE_SUMMARY.md"), renderExecutiveSummary(state), "utf8");
  if (fail > 0) process.exit(1);
}

main();

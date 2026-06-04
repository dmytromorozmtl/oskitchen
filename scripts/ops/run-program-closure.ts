/**
 * FINAL-26 / task-220 — program closure gate (all 220 canonical slots + tracker keys done).
 *
 * Usage: npx tsx scripts/ops/run-program-closure.ts [--write]
 */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { auditProgramClosure } from "../../lib/execution/audit-program-closure";
import {
  PROGRAM_CLOSURE_RUNNER_SCRIPT,
  PROGRAM_CLOSURE_SUMMARY_ARTIFACT,
  PROGRAM_CLOSURE_SUMMARY_VERSION,
  PROGRAM_CLOSURE_VITEST_SPEC,
} from "../../lib/execution/program-closure-policy";

const VITEST_BIN = "node ./node_modules/vitest/vitest.mjs run";

function parseVitestOutput(output: string): { passed: number; failed: number } {
  const filesMatch = output.match(/Test Files\s+(\d+) failed[^\d]*(\d+) passed|Test Files\s+(\d+) passed/);
  const failed = filesMatch?.[1] != null ? Number(filesMatch[1]) : 0;
  const passed = filesMatch?.[2] != null ? Number(filesMatch[2]) : Number(filesMatch?.[3] ?? 0);
  return { passed, failed };
}

function main() {
  const write = process.argv.includes("--write");
  const root = process.cwd();
  const runAt = new Date().toISOString();

  const closure = auditProgramClosure(root);

  let vitestPassed = false;
  try {
    const vitestOut = execSync(`${VITEST_BIN} ${PROGRAM_CLOSURE_VITEST_SPEC} --maxWorkers=1`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 20 * 1024 * 1024,
    });
    const parsed = parseVitestOutput(vitestOut);
    vitestPassed = parsed.failed === 0 && parsed.passed > 0;
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string };
    const parsed = parseVitestOutput(`${err.stdout ?? ""}\n${err.stderr ?? ""}`);
    vitestPassed = parsed.failed === 0 && parsed.passed > 0;
  }

  const overall = closure.passed && vitestPassed ? ("PASS" as const) : ("FAIL" as const);
  const proofStatus =
    overall === "PASS" ? "proof_passed_program_closure" : "proof_failed_program_closure";

  if (write) {
    const summary = {
      version: PROGRAM_CLOSURE_SUMMARY_VERSION,
      task: "FINAL-26",
      runAt,
      overall,
      proofStatus,
      vitestPassed,
      canonicalSlotsDone: closure.canonicalSlotsDone,
      canonicalSlotsTotal: closure.canonicalSlotsTotal,
      allTrackerKeysDone: closure.allTrackerKeysDone,
      finalOrchestratorComplete: closure.finalOrchestratorComplete,
      runner: PROGRAM_CLOSURE_RUNNER_SCRIPT,
      honestyNote:
        "220/220 execution tracker complete; ready:false and NO-GO remain honest until P0 vault PASS and pilot GO.",
    };
    const summaryPath = join(root, PROGRAM_CLOSURE_SUMMARY_ARTIFACT);
    mkdirSync(dirname(summaryPath), { recursive: true });
    writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }

  console.log("\n=== Program closure (FINAL-26) ===");
  console.log(`  overall:            ${overall}`);
  console.log(`  proofStatus:        ${proofStatus}`);
  console.log(
    `  canonical:          ${closure.canonicalSlotsDone}/${closure.canonicalSlotsTotal}`,
  );
  console.log(`  all keys done:      ${closure.allTrackerKeysDone}`);
  console.log(`  FINAL-25 prereq:    ${closure.final25PrerequisitePassed}`);
  console.log(`  artifact:           ${PROGRAM_CLOSURE_SUMMARY_ARTIFACT}\n`);

  if (overall === "FAIL") {
    process.exit(1);
  }
}

main();

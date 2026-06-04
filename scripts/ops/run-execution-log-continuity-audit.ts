/**
 * FINAL-24 / task-218 — execution log cycle continuity audit + header marker.
 *
 * Usage: npx tsx scripts/ops/run-execution-log-continuity-audit.ts [--write]
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  auditExecutionLogContinuity,
  ensureExecutionLogHeader,
} from "../../lib/execution/audit-execution-log-continuity";
import {
  EXECUTION_LOG_ARTIFACT,
  EXECUTION_LOG_CONTINUITY_SUMMARY_ARTIFACT,
  EXECUTION_LOG_CONTINUITY_SUMMARY_VERSION,
  EXECUTION_LOG_RUNNER_SCRIPT,
  EXECUTION_LOG_VITEST_SPEC,
} from "../../lib/execution/execution-log-policy";

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

  let audit = auditExecutionLogContinuity(root);

  if (write && audit.logPresent) {
    const path = join(root, EXECUTION_LOG_ARTIFACT);
    const content = readFileSync(path, "utf8");
    const updated = ensureExecutionLogHeader(content);
    if (updated !== content) {
      writeFileSync(path, updated, "utf8");
    }
    audit = auditExecutionLogContinuity(root);
  }

  let vitestPassed = false;
  try {
    const vitestOut = execSync(`${VITEST_BIN} ${EXECUTION_LOG_VITEST_SPEC} --maxWorkers=1`, {
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

  const continuityPassed = audit.continuityHonest && audit.headerMarkerPresent;

  const overall = continuityPassed && vitestPassed ? ("PASS" as const) : ("FAIL" as const);
  const proofStatus =
    overall === "PASS" ? "proof_passed_execution_log_continuity" : "proof_failed_execution_log";

  if (write) {
    const summary = {
      version: EXECUTION_LOG_CONTINUITY_SUMMARY_VERSION,
      task: "FINAL-24",
      runAt,
      overall,
      proofStatus,
      vitestPassed,
      ...audit,
      logArtifact: EXECUTION_LOG_ARTIFACT,
      runner: EXECUTION_LOG_RUNNER_SCRIPT,
      honestyNote:
        "PASS when execution-log.txt contains cycles 211–213+, modern field blocks, and FINAL-24 header marker; does not imply all 220 slots done.",
    };
    const summaryPath = join(root, EXECUTION_LOG_CONTINUITY_SUMMARY_ARTIFACT);
    mkdirSync(dirname(summaryPath), { recursive: true });
    writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }

  console.log("\n=== Execution log continuity (FINAL-24) ===");
  console.log(`  overall:            ${overall}`);
  console.log(`  proofStatus:        ${proofStatus}`);
  console.log(`  last cycle:         ${audit.lastCycle}`);
  console.log(`  total cycles:       ${audit.totalCycles}`);
  console.log(`  211/212/213:        ${audit.hasCycle211}/${audit.hasCycle212}/${audit.hasCycle213}`);
  console.log(`  header marker:      ${audit.headerMarkerPresent}`);
  console.log(`  artifact:           ${EXECUTION_LOG_CONTINUITY_SUMMARY_ARTIFACT}\n`);

  if (overall === "FAIL") {
    process.exit(1);
  }
}

main();

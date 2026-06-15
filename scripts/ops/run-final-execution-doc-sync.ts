/**
 * FINAL-23 / task-217 — sync docs/final-execution-report.md from JSON snapshot.
 *
 * Usage: npx tsx scripts/ops/run-final-execution-doc-sync.ts [--write]
 */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  FINAL_EXECUTION_DOC_PATH,
  FINAL_EXECUTION_DOC_RUNNER_SCRIPT,
  FINAL_EXECUTION_DOC_SYNC_SUMMARY_ARTIFACT,
  FINAL_EXECUTION_DOC_SYNC_SUMMARY_VERSION,
  FINAL_EXECUTION_DOC_VITEST_SPEC,
} from "../../lib/execution/final-execution-doc-policy";
import {
  auditFinalExecutionDocContent,
  syncFinalExecutionDoc,
} from "../../lib/execution/sync-final-execution-doc";
import { FINAL_EXECUTION_JSON_SYNC_SUMMARY_VERSION } from "../../lib/execution/final-execution-json-policy";

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

  const { markdown, report } = syncFinalExecutionDoc(root);
  const docContentValid = auditFinalExecutionDocContent(markdown, report);

  if (write) {
    const docPath = join(root, FINAL_EXECUTION_DOC_PATH);
    writeFileSync(docPath, `${markdown}\n`, "utf8");
  }

  let vitestPassed = false;
  try {
    const vitestOut = execSync(`${VITEST_BIN} ${FINAL_EXECUTION_DOC_VITEST_SPEC} --maxWorkers=1`, {
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

  const overall = docContentValid && vitestPassed ? ("PASS" as const) : ("FAIL" as const);
  const proofStatus =
    overall === "PASS" ? "proof_synced_final_execution_doc" : "proof_failed_final_execution_doc";

  if (write) {
    const summary = {
      version: FINAL_EXECUTION_DOC_SYNC_SUMMARY_VERSION,
      task: "FINAL-23",
      runAt,
      overall,
      proofStatus,
      docContentValid,
      vitestPassed,
      docPath: FINAL_EXECUTION_DOC_PATH,
      jsonVersion: report.version,
      trackerDoneCount: report.trackerSync.doneCount,
      goDecision: report.goDecision,
      ready: report.ready,
      runner: FINAL_EXECUTION_DOC_RUNNER_SCRIPT,
      jsonSyncVersion: FINAL_EXECUTION_JSON_SYNC_SUMMARY_VERSION,
      honestyNote:
        "PASS when markdown mirrors final-execution-report.json tracker/gate snapshot; does not certify pilot GO.",
    };
    const summaryPath = join(root, FINAL_EXECUTION_DOC_SYNC_SUMMARY_ARTIFACT);
    mkdirSync(dirname(summaryPath), { recursive: true });
    writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }

  console.log("\n=== Final execution doc sync (FINAL-23) ===");
  console.log(`  overall:            ${overall}`);
  console.log(`  proofStatus:        ${proofStatus}`);
  console.log(`  doc valid:          ${docContentValid}`);
  console.log(`  vitest:             ${vitestPassed ? "PASS" : "FAIL"}`);
  console.log(`  doc:                ${FINAL_EXECUTION_DOC_PATH}\n`);

  if (overall === "FAIL") {
    process.exit(1);
  }
}

main();

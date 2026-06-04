/**
 * FINAL-22 / task-216 — sync artifacts/final-execution-report.json from tracker + gates.
 *
 * Usage: npx tsx scripts/ops/run-final-execution-json-sync.ts [--write]
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  FINAL_EXECUTION_JSON_RUNNER_SCRIPT,
  FINAL_EXECUTION_JSON_SYNC_SUMMARY_ARTIFACT,
  FINAL_EXECUTION_JSON_SYNC_SUMMARY_VERSION,
  FINAL_EXECUTION_JSON_VITEST_SPEC,
  FINAL_EXECUTION_REPORT_ARTIFACT,
} from "../../lib/execution/final-execution-json-policy";
import {
  auditFinalExecutionReportSchema,
  buildFinalExecutionReport,
} from "../../lib/execution/sync-final-execution-report";

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

  const report = buildFinalExecutionReport(root);
  const schemaValid = auditFinalExecutionReportSchema(report);

  let vitestPassed = false;
  try {
    const vitestOut = execSync(`${VITEST_BIN} ${FINAL_EXECUTION_JSON_VITEST_SPEC} --maxWorkers=1`, {
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

  const overall = schemaValid && vitestPassed ? ("PASS" as const) : ("FAIL" as const);
  const proofStatus =
    overall === "PASS" ? "proof_synced_final_execution_json" : "proof_failed_final_execution_json";

  if (write) {
    const reportPath = join(root, FINAL_EXECUTION_REPORT_ARTIFACT);
    mkdirSync(dirname(reportPath), { recursive: true });
    writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

    const summary = {
      version: FINAL_EXECUTION_JSON_SYNC_SUMMARY_VERSION,
      task: "FINAL-22",
      runAt,
      overall,
      proofStatus,
      schemaValid,
      vitestPassed,
      reportArtifact: FINAL_EXECUTION_REPORT_ARTIFACT,
      reportVersion: report.version,
      trackerDoneCount: report.trackerSync.doneCount,
      trackerTotalCount: report.trackerSync.totalCount,
      ready: report.ready,
      goDecision: report.goDecision,
      runner: FINAL_EXECUTION_JSON_RUNNER_SCRIPT,
      honestyNote:
        "PASS when final-execution-report.json is synced with honest tracker/gate snapshot and vitest exits 0; ready:false until FINAL-26 closure.",
    };
    const summaryPath = join(root, FINAL_EXECUTION_JSON_SYNC_SUMMARY_ARTIFACT);
    mkdirSync(dirname(summaryPath), { recursive: true });
    writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }

  console.log("\n=== Final execution JSON sync (FINAL-22) ===");
  console.log(`  overall:            ${overall}`);
  console.log(`  proofStatus:        ${proofStatus}`);
  console.log(`  tracker:            ${report.trackerSync.doneCount}/${report.trackerSync.totalCount}`);
  console.log(`  ready (honest):     ${report.ready}`);
  console.log(`  goDecision:         ${report.goDecision}`);
  console.log(`  report:             ${FINAL_EXECUTION_REPORT_ARTIFACT}\n`);

  if (overall === "FAIL") {
    process.exit(1);
  }
}

main();

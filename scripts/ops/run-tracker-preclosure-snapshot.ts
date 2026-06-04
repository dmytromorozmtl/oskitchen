/**
 * FINAL-25 / task-219 — pre-closure tracker snapshot artifact.
 *
 * Usage: npx tsx scripts/ops/run-tracker-preclosure-snapshot.ts [--write]
 */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  auditTrackerPreclosureSnapshot,
  buildTrackerPreclosureSnapshot,
} from "../../lib/execution/build-tracker-preclosure-snapshot";
import {
  TRACKER_PRECLOSURE_RUNNER_SCRIPT,
  TRACKER_PRECLOSURE_SNAPSHOT_ARTIFACT,
  TRACKER_PRECLOSURE_SUMMARY_ARTIFACT,
  TRACKER_PRECLOSURE_SUMMARY_VERSION,
  TRACKER_PRECLOSURE_VITEST_SPEC,
} from "../../lib/execution/tracker-preclosure-policy";

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

  const snapshot = buildTrackerPreclosureSnapshot(root);
  const snapshotValid = auditTrackerPreclosureSnapshot(snapshot);

  let vitestPassed = false;
  try {
    const vitestOut = execSync(`${VITEST_BIN} ${TRACKER_PRECLOSURE_VITEST_SPEC} --maxWorkers=1`, {
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

  const overall = snapshotValid && vitestPassed ? ("PASS" as const) : ("FAIL" as const);
  const proofStatus =
    overall === "PASS" ? "proof_passed_preclosure_snapshot" : "proof_failed_preclosure_snapshot";

  if (write) {
    const snapPath = join(root, TRACKER_PRECLOSURE_SNAPSHOT_ARTIFACT);
    mkdirSync(dirname(snapPath), { recursive: true });
    writeFileSync(snapPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

    const summary = {
      version: TRACKER_PRECLOSURE_SUMMARY_VERSION,
      task: "FINAL-25",
      runAt,
      overall,
      proofStatus,
      snapshotValid,
      vitestPassed,
      canonicalSlotsDone: snapshot.canonicalSlotsDone,
      canonicalSlotsTotal: snapshot.canonicalSlotsTotal,
      remainingCanonicalSlots: snapshot.remainingCanonicalSlots,
      remainingFinalPhases: snapshot.remainingFinalPhases,
      preClosureReady: snapshot.preClosureReady,
      trackerDoneCount: snapshot.doneCount,
      trackerTotalKeys: snapshot.totalKeys,
      snapshotArtifact: TRACKER_PRECLOSURE_SNAPSHOT_ARTIFACT,
      runner: TRACKER_PRECLOSURE_RUNNER_SCRIPT,
      honestyNote: snapshot.honestyNote,
    };
    const summaryPath = join(root, TRACKER_PRECLOSURE_SUMMARY_ARTIFACT);
    mkdirSync(dirname(summaryPath), { recursive: true });
    writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }

  console.log("\n=== Tracker pre-closure snapshot (FINAL-25) ===");
  console.log(`  overall:            ${overall}`);
  console.log(`  proofStatus:        ${proofStatus}`);
  console.log(
    `  canonical:          ${snapshot.canonicalSlotsDone}/${snapshot.canonicalSlotsTotal}`,
  );
  console.log(`  remaining slots:    ${snapshot.remainingCanonicalSlots.join(", ") || "(none)"}`);
  console.log(`  remaining FINAL:    ${snapshot.remainingFinalPhases.join(", ") || "(none)"}`);
  console.log(`  preClosureReady:    ${snapshot.preClosureReady}`);
  console.log(`  artifact:           ${TRACKER_PRECLOSURE_SNAPSHOT_ARTIFACT}\n`);

  if (overall === "FAIL") {
    process.exit(1);
  }
}

main();

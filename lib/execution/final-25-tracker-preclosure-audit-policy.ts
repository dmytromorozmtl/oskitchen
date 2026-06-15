import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  auditTrackerPreclosureSnapshot,
  buildTrackerPreclosureSnapshot,
} from "@/lib/execution/build-tracker-preclosure-snapshot";
import {
  EXECUTION_LOG_CONTINUITY_SUMMARY_ARTIFACT,
  EXECUTION_LOG_CONTINUITY_SUMMARY_VERSION,
} from "@/lib/execution/execution-log-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  TRACKER_ARTIFACT,
  TRACKER_PRECLOSURE_POLICY_ID,
  TRACKER_PRECLOSURE_RUNNER_SCRIPT,
  TRACKER_PRECLOSURE_SNAPSHOT_ARTIFACT,
  TRACKER_PRECLOSURE_SUMMARY_ARTIFACT,
  TRACKER_PRECLOSURE_SUMMARY_VERSION,
  TRACKER_PRECLOSURE_VITEST_SPEC,
} from "@/lib/execution/tracker-preclosure-policy";

/**
 * FINAL-25 — Pre-closure tracker snapshot gate (task-219).
 */

export const FINAL_25_TRACKER_PRECLOSURE_POLICY_ID = TRACKER_PRECLOSURE_POLICY_ID;

export type Final25TrackerPreclosureAuditReport = {
  policyId: typeof FINAL_25_TRACKER_PRECLOSURE_POLICY_ID;
  phaseId: "FINAL-25";
  taskSlot: number;
  trackerPresent: boolean;
  snapshotPresent: boolean;
  snapshotHonest: boolean;
  artifactPresent: boolean;
  artifactSchemaValid: boolean;
  preclosureHonest: boolean;
  runnerScriptPresent: boolean;
  final24Passed: boolean;
  passed: boolean;
};

function readFinal24ArtifactPassed(root: string): boolean {
  const path = join(root, EXECUTION_LOG_CONTINUITY_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return false;
  const summary = JSON.parse(readFileSync(path, "utf8")) as {
    version?: string;
    overall?: string;
    proofStatus?: string;
    vitestPassed?: boolean;
  };
  return (
    summary.version === EXECUTION_LOG_CONTINUITY_SUMMARY_VERSION &&
    summary.overall === "PASS" &&
    summary.proofStatus === "proof_passed_execution_log_continuity" &&
    summary.vitestPassed === true
  );
}

export function auditFinal25TrackerPreclosure(
  root = process.cwd(),
): Final25TrackerPreclosureAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[24]!;
  const trackerPresent = existsSync(join(root, TRACKER_ARTIFACT));
  const snapshotPresent = existsSync(join(root, TRACKER_PRECLOSURE_SNAPSHOT_ARTIFACT));

  let snapshotHonest = false;
  if (snapshotPresent) {
    const snapshot = JSON.parse(
      readFileSync(join(root, TRACKER_PRECLOSURE_SNAPSHOT_ARTIFACT), "utf8"),
    ) as ReturnType<typeof buildTrackerPreclosureSnapshot>;
    snapshotHonest = auditTrackerPreclosureSnapshot(snapshot);
  }

  const artifactPath = join(root, TRACKER_PRECLOSURE_SUMMARY_ARTIFACT);
  const artifactPresent = existsSync(artifactPath);

  let artifactSchemaValid = false;
  let preclosureHonest = false;

  if (artifactPresent) {
    const summary = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      version?: string;
      overall?: string;
      proofStatus?: string;
      canonicalSlotsDone?: number;
      remainingCanonicalSlots?: number[];
      runner?: string;
      honestyNote?: string;
    };

    artifactSchemaValid =
      summary.version === TRACKER_PRECLOSURE_SUMMARY_VERSION &&
      summary.runner === TRACKER_PRECLOSURE_RUNNER_SCRIPT &&
      (summary.canonicalSlotsDone ?? 0) >= 218 &&
      Array.isArray(summary.remainingCanonicalSlots) &&
      typeof summary.honestyNote === "string";

    preclosureHonest =
      summary.overall === "PASS" && summary.proofStatus === "proof_passed_preclosure_snapshot";
  }

  const runnerScriptPresent = existsSync(join(root, TRACKER_PRECLOSURE_RUNNER_SCRIPT));
  const final24Passed = readFinal24ArtifactPassed(root);

  const passed =
    trackerPresent &&
    snapshotPresent &&
    snapshotHonest &&
    artifactPresent &&
    artifactSchemaValid &&
    preclosureHonest &&
    runnerScriptPresent &&
    final24Passed;

  return {
    policyId: FINAL_25_TRACKER_PRECLOSURE_POLICY_ID,
    phaseId: "FINAL-25",
    taskSlot: phase.taskSlot,
    trackerPresent,
    snapshotPresent,
    snapshotHonest,
    artifactPresent,
    artifactSchemaValid,
    preclosureHonest,
    runnerScriptPresent,
    final24Passed,
    passed,
  };
}

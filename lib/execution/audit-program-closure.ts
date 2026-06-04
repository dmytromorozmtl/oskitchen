import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { CANONICAL_TASK_SLOT_COUNT } from "@/lib/execution/tracker-preclosure-policy";
import { taskSlotKey } from "@/lib/execution/execution-tracker-slot-registry";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  PROGRAM_CLOSURE_POLICY_ID,
  PROGRAM_CLOSURE_TRACKER_ARTIFACT,
} from "@/lib/execution/program-closure-policy";
import {
  TRACKER_PRECLOSURE_SNAPSHOT_ARTIFACT,
  TRACKER_PRECLOSURE_SUMMARY_ARTIFACT,
  TRACKER_PRECLOSURE_SUMMARY_VERSION,
} from "@/lib/execution/tracker-preclosure-policy";
import { auditTrackerPreclosureSnapshot } from "@/lib/execution/build-tracker-preclosure-snapshot";
import type { TrackerPreclosureSnapshot } from "@/lib/execution/build-tracker-preclosure-snapshot";

export type ProgramClosureAuditReport = {
  policyId: typeof PROGRAM_CLOSURE_POLICY_ID;
  phaseId: "FINAL-26";
  taskSlot: number;
  trackerPresent: boolean;
  canonicalSlotsDone: number;
  canonicalSlotsTotal: number;
  allCanonicalDone: boolean;
  allTrackerKeysDone: boolean;
  finalOrchestratorComplete: boolean;
  final25PrerequisitePassed: boolean;
  passed: boolean;
};

function readTracker(root: string): Record<string, string> {
  return JSON.parse(
    readFileSync(join(root, PROGRAM_CLOSURE_TRACKER_ARTIFACT), "utf8"),
  ) as Record<string, string>;
}

function readFinal25Passed(root: string): boolean {
  const summaryPath = join(root, TRACKER_PRECLOSURE_SUMMARY_ARTIFACT);
  if (existsSync(summaryPath)) {
    const summary = JSON.parse(readFileSync(summaryPath, "utf8")) as {
      version?: string;
      overall?: string;
      proofStatus?: string;
    };
    if (
      summary.version === TRACKER_PRECLOSURE_SUMMARY_VERSION &&
      summary.overall === "PASS" &&
      summary.proofStatus === "proof_passed_preclosure_snapshot"
    ) {
      return true;
    }
  }

  const snapshotPath = join(root, TRACKER_PRECLOSURE_SNAPSHOT_ARTIFACT);
  if (!existsSync(snapshotPath)) return false;
  const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8")) as TrackerPreclosureSnapshot;
  return snapshot.task === "FINAL-25" && auditTrackerPreclosureSnapshot(snapshot);
}

export function auditProgramClosure(root = process.cwd()): ProgramClosureAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[25]!;
  const trackerPresent = existsSync(join(root, PROGRAM_CLOSURE_TRACKER_ARTIFACT));

  let canonicalSlotsDone = 0;
  let allCanonicalDone = false;
  let allTrackerKeysDone = false;
  let finalOrchestratorComplete = false;

  if (trackerPresent) {
    const tracker = readTracker(root);
    for (let slot = 1; slot <= CANONICAL_TASK_SLOT_COUNT; slot++) {
      if (tracker[taskSlotKey(slot)] === "done") canonicalSlotsDone++;
    }
    allCanonicalDone = canonicalSlotsDone === CANONICAL_TASK_SLOT_COUNT;
    allTrackerKeysDone = Object.values(tracker).every((v) => v === "done");
    finalOrchestratorComplete = FINAL_ORCHESTRATOR_PHASES.every((p) => {
      const taskDone = tracker[taskSlotKey(p.taskSlot)] === "done";
      const phaseDone = tracker[p.id] === "done" || taskDone;
      return taskDone && phaseDone;
    });
  }

  const final25PrerequisitePassed = readFinal25Passed(root);

  const passed =
    trackerPresent &&
    allCanonicalDone &&
    allTrackerKeysDone &&
    finalOrchestratorComplete &&
    final25PrerequisitePassed;

  return {
    policyId: PROGRAM_CLOSURE_POLICY_ID,
    phaseId: "FINAL-26",
    taskSlot: phase.taskSlot,
    trackerPresent,
    canonicalSlotsDone,
    canonicalSlotsTotal: CANONICAL_TASK_SLOT_COUNT,
    allCanonicalDone,
    allTrackerKeysDone,
    finalOrchestratorComplete,
    final25PrerequisitePassed,
    passed,
  };
}

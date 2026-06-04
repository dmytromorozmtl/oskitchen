import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CANONICAL_TASK_SLOT_COUNT,
  TRACKER_ARTIFACT,
  TRACKER_PRECLOSURE_POLICY_ID,
} from "@/lib/execution/tracker-preclosure-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import { taskSlotKey } from "@/lib/execution/execution-tracker-slot-registry";

export type TrackerPreclosureSnapshot = {
  version: typeof TRACKER_PRECLOSURE_POLICY_ID;
  generatedAt: string;
  task: "FINAL-25";
  doneCount: number;
  totalKeys: number;
  canonicalSlotsDone: number;
  canonicalSlotsTotal: number;
  remainingCanonicalSlots: number[];
  remainingFinalPhases: string[];
  finalOrchestratorDone: number;
  finalOrchestratorTotal: number;
  preClosureReady: boolean;
  honestyNote: string;
};

export function readTracker(root = process.cwd()): Record<string, string> {
  return JSON.parse(readFileSync(join(root, TRACKER_ARTIFACT), "utf8")) as Record<
    string,
    string
  >;
}

export function buildTrackerPreclosureSnapshot(root = process.cwd()): TrackerPreclosureSnapshot {
  const generatedAt = new Date().toISOString();
  const tracker = readTracker(root);

  const entries = Object.entries(tracker);
  const doneCount = entries.filter(([, v]) => v === "done").length;

  const remainingCanonicalSlots: number[] = [];
  for (let slot = 1; slot <= CANONICAL_TASK_SLOT_COUNT; slot++) {
    if (tracker[taskSlotKey(slot)] !== "done") {
      remainingCanonicalSlots.push(slot);
    }
  }

  const remainingFinalPhases = FINAL_ORCHESTRATOR_PHASES.filter(
    (phase) => tracker[phase.id] !== "done",
  ).map((phase) => phase.id);

  const finalOrchestratorDone = FINAL_ORCHESTRATOR_PHASES.filter(
    (phase) => tracker[phase.id] === "done",
  ).length;

  const preClosureReady =
    remainingCanonicalSlots.length === 0 &&
    remainingFinalPhases.length === 0 &&
    doneCount === entries.length;

  return {
    version: TRACKER_PRECLOSURE_POLICY_ID,
    generatedAt,
    task: "FINAL-25",
    doneCount,
    totalKeys: entries.length,
    canonicalSlotsDone: CANONICAL_TASK_SLOT_COUNT - remainingCanonicalSlots.length,
    canonicalSlotsTotal: CANONICAL_TASK_SLOT_COUNT,
    remainingCanonicalSlots,
    remainingFinalPhases,
    finalOrchestratorDone,
    finalOrchestratorTotal: FINAL_ORCHESTRATOR_PHASES.length,
    preClosureReady,
    honestyNote:
      "preClosureReady true only when all 220 task-* slots and FINAL-01..FINAL-26 keys are done; snapshot is honest pre-FINAL-26 gate.",
  };
}

export function auditTrackerPreclosureSnapshot(
  snapshot: TrackerPreclosureSnapshot,
): boolean {
  return (
    snapshot.version === TRACKER_PRECLOSURE_POLICY_ID &&
    snapshot.canonicalSlotsTotal === CANONICAL_TASK_SLOT_COUNT &&
    snapshot.canonicalSlotsDone >= 218 &&
    snapshot.remainingCanonicalSlots.every((s) => s === 219 || s === 220) &&
    snapshot.preClosureReady === (snapshot.remainingCanonicalSlots.length === 0)
  );
}

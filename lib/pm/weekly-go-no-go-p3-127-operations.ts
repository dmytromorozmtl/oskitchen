import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  WEEKLY_GO_NO_GO_GATES,
  WEEKLY_GO_NO_GO_POLICY_ID,
  type WeeklyGoNoGoDecision,
  type WeeklyGoNoGoGateId,
  type WeeklyGoNoGoGateStatus,
} from "@/lib/pm/weekly-go-no-go-p3-127-policy";

export type WeeklyGoNoGoGateRecord = {
  id: WeeklyGoNoGoGateId;
  status: WeeklyGoNoGoGateStatus;
  command: string;
  note: string;
};

export type WeeklyGoNoGoLogEntry = {
  weekId: string;
  recordedAt: string;
  decision: WeeklyGoNoGoDecision;
  gates: WeeklyGoNoGoGateRecord[];
  reviewer: string | null;
  notes: string;
};

export type WeeklyGoNoGoLog = {
  version: string;
  policyId: typeof WEEKLY_GO_NO_GO_POLICY_ID;
  honestyNote: string;
  entries: WeeklyGoNoGoLogEntry[];
};

export function loadWeeklyGoNoGoLog(
  root = process.cwd(),
  artifactPath = "artifacts/weekly-go-no-go-log.json",
): WeeklyGoNoGoLog {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as WeeklyGoNoGoLog;
}

export function validateWeeklyGoNoGoLog(log: WeeklyGoNoGoLog): {
  valid: boolean;
  policyIdMatches: boolean;
  hasEntries: boolean;
  gatesComplete: boolean;
  gateIdsMatch: boolean;
} {
  const policyIdMatches = log.policyId === WEEKLY_GO_NO_GO_POLICY_ID;
  const hasEntries = log.entries.length >= 1;

  const expectedGateIds = WEEKLY_GO_NO_GO_GATES.map((gate) => gate.id);
  const gateIdsMatch = log.entries.every((entry) => {
    const entryIds = entry.gates.map((gate) => gate.id);
    return (
      entryIds.length === expectedGateIds.length &&
      expectedGateIds.every((id, index) => entryIds[index] === id)
    );
  });

  const gatesComplete = log.entries.every(
    (entry) =>
      entry.gates.length === WEEKLY_GO_NO_GO_GATES.length &&
      entry.gates.every((gate) => gate.command.length > 0 && gate.note.length > 0),
  );

  const valid = policyIdMatches && hasEntries && gatesComplete && gateIdsMatch;

  return {
    valid,
    policyIdMatches,
    hasEntries,
    gatesComplete,
    gateIdsMatch,
  };
}

export function deriveWeeklyDecisionFromGates(
  gates: readonly WeeklyGoNoGoGateRecord[],
): WeeklyGoNoGoDecision {
  const actionable = gates.filter((gate) => gate.status !== "skipped");
  if (actionable.length === 0) {
    return "NO-GO";
  }
  if (actionable.every((gate) => gate.status === "pass")) {
    return "GO";
  }
  if (actionable.some((gate) => gate.status === "pass")) {
    return "PARTIAL";
  }
  return "NO-GO";
}

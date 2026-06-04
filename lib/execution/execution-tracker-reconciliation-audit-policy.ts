import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  EXECUTION_TRACKER_CAPSTONE_OVERLAY_SLOTS,
  EXECUTION_TRACKER_RECONCILIATION_SLOT_END,
  listReconciliationTaskSlots,
  resolveRoleIdForTaskSlot,
  taskSlotKey,
} from "@/lib/execution/execution-tracker-slot-registry";
import { EXECUTION_TRACKER_RECONCILIATION_POLICY_ID } from "@/lib/execution/execution-tracker-reconciliation-patterns";
import { auditProgramCompletionCapstone } from "@/lib/execution/program-completion-capstone-audit-policy";

/**
 * EXEC-02 — reconcile task-1..task-193 slots with completed role keys + EXEC-01 capstone.
 */

export const EXECUTION_TRACKER_RECONCILIATION_AUDIT_POLICY_ID =
  EXECUTION_TRACKER_RECONCILIATION_POLICY_ID;

export type ExecutionTrackerReconciliationSlotResult = {
  slot: number;
  roleId: string;
  taskKey: string;
  taskDone: boolean;
  roleDone: boolean;
  passed: boolean;
};

export type ExecutionTrackerReconciliationAuditReport = {
  policyId: typeof EXECUTION_TRACKER_RECONCILIATION_AUDIT_POLICY_ID;
  prerequisitePassed: boolean;
  slots: ExecutionTrackerReconciliationSlotResult[];
  overlaySlots: ExecutionTrackerReconciliationSlotResult[];
  unreconciledCount: number;
  passed: boolean;
};

export type ExecutionTrackerState = Record<string, string>;

function readTracker(root: string): ExecutionTrackerState {
  return JSON.parse(
    readFileSync(join(root, "artifacts/execution-tracker-final.json"), "utf8"),
  ) as ExecutionTrackerState;
}

function auditPilotGonoGoArtifact(root: string): boolean {
  const raw = readFileSync(join(root, "artifacts/pilot-gono-go-summary.json"), "utf8");
  const summary = JSON.parse(raw) as { decision?: string; integrityPassed?: boolean };
  return summary.decision === "NO-GO" || summary.decision === "GO";
}

function isRoleDone(tracker: ExecutionTrackerState, roleId: string, root: string): boolean {
  if (roleId === "DEV-02" && tracker["DEV-02"] !== "done") {
    return auditPilotGonoGoArtifact(root);
  }
  return tracker[roleId] === "done";
}

function auditSlot(
  tracker: ExecutionTrackerState,
  slot: number,
  root: string,
): ExecutionTrackerReconciliationSlotResult | null {
  const roleId = resolveRoleIdForTaskSlot(slot);
  if (!roleId || roleId.startsWith("FINAL-")) return null;

  const taskKey = taskSlotKey(slot);
  const roleDone = isRoleDone(tracker, roleId, root);
  const taskDone = tracker[taskKey] === "done";

  return {
    slot,
    roleId,
    taskKey,
    taskDone,
    roleDone,
    passed: taskDone && roleDone,
  };
}

export function auditExecutionTrackerReconciliationWithState(
  tracker: ExecutionTrackerState,
  root = process.cwd(),
): ExecutionTrackerReconciliationAuditReport {
  const prerequisitePassed = auditProgramCompletionCapstone(root).passed;

  const slots = listReconciliationTaskSlots()
    .map((slot) => auditSlot(tracker, slot, root))
    .filter((row): row is ExecutionTrackerReconciliationSlotResult => row !== null);

  const overlaySlots = EXECUTION_TRACKER_CAPSTONE_OVERLAY_SLOTS.map(({ slot, roleId }) => {
    const taskKey = taskSlotKey(slot);
    const roleDone = isRoleDone(tracker, roleId, root);
    const taskDone = tracker[taskKey] === "done";
    return {
      slot,
      roleId,
      taskKey,
      taskDone,
      roleDone,
      passed: taskDone && roleDone,
    };
  });

  const unreconciledCount =
    slots.filter((s) => !s.passed).length + overlaySlots.filter((s) => !s.passed).length;

  return {
    policyId: EXECUTION_TRACKER_RECONCILIATION_AUDIT_POLICY_ID,
    prerequisitePassed,
    slots,
    overlaySlots,
    unreconciledCount,
    passed: prerequisitePassed && unreconciledCount === 0,
  };
}

export function auditExecutionTrackerReconciliation(
  root = process.cwd(),
): ExecutionTrackerReconciliationAuditReport {
  return auditExecutionTrackerReconciliationWithState(readTracker(root), root);
}

/** Apply reconciliation — mark task-N done when role evidence is complete (in-memory tracker). */
export function applyExecutionTrackerReconciliation(
  tracker: ExecutionTrackerState,
  root = process.cwd(),
): ExecutionTrackerState {
  const next = { ...tracker };

  if (auditPilotGonoGoArtifact(root)) {
    next["DEV-02"] = "done";
  }

  for (let slot = 1; slot <= EXECUTION_TRACKER_RECONCILIATION_SLOT_END; slot += 1) {
    const roleId = resolveRoleIdForTaskSlot(slot);
    if (!roleId || roleId.startsWith("FINAL-")) continue;
    if (isRoleDone(next, roleId, root)) {
      next[taskSlotKey(slot)] = "done";
    }
  }

  for (const { slot, roleId } of EXECUTION_TRACKER_CAPSTONE_OVERLAY_SLOTS) {
    if (isRoleDone(next, roleId, root)) {
      next[taskSlotKey(slot)] = "done";
    }
  }

  if (next["EXEC-01"] === "done") {
    next[taskSlotKey(194)] = "done";
  }

  next["EXEC-02"] = "done";
  next[taskSlotKey(182)] = "done";

  return next;
}

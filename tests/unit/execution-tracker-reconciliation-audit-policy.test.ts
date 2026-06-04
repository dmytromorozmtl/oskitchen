import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  applyExecutionTrackerReconciliation,
  auditExecutionTrackerReconciliation,
  auditExecutionTrackerReconciliationWithState,
  EXECUTION_TRACKER_RECONCILIATION_AUDIT_POLICY_ID,
} from "@/lib/execution/execution-tracker-reconciliation-audit-policy";
import { EXECUTION_TRACKER_RECONCILIATION_POLICY_ID } from "@/lib/execution/execution-tracker-reconciliation-patterns";
import {
  EXECUTION_TRACKER_SLOT_COUNT,
  resolveRoleIdForTaskSlot,
} from "@/lib/execution/execution-tracker-slot-registry";

const TRACKER_PATH = join(process.cwd(), "artifacts/execution-tracker-final.json");

describe("execution tracker reconciliation audit (EXEC-02 / task-182)", () => {
  it("locks EXEC-02 policy id and 220-slot registry coverage", () => {
    expect(EXECUTION_TRACKER_RECONCILIATION_POLICY_ID).toBe(
      "execution-tracker-reconciliation-exec02-v1",
    );
    expect(EXECUTION_TRACKER_RECONCILIATION_AUDIT_POLICY_ID).toBe(
      EXECUTION_TRACKER_RECONCILIATION_POLICY_ID,
    );
    expect(resolveRoleIdForTaskSlot(1)).toBe("DEV-01");
    expect(resolveRoleIdForTaskSlot(116)).toBe("DEV-26");
    expect(resolveRoleIdForTaskSlot(194)).toBe("EXEC-02");
    expect(resolveRoleIdForTaskSlot(EXECUTION_TRACKER_SLOT_COUNT)).toBe("FINAL-26");
  });

  it("passes reconciliation after in-memory slot backfill", () => {
    const tracker = JSON.parse(readFileSync(TRACKER_PATH, "utf8")) as Record<string, string>;
    const reconciled = applyExecutionTrackerReconciliation(tracker);
    const report = auditExecutionTrackerReconciliationWithState(reconciled);
    expect(report.prerequisitePassed).toBe(true);
    expect(report.unreconciledCount).toBe(0);
    expect(report.passed).toBe(true);
    expect(report.slots.every((s) => s.passed)).toBe(true);
    expect(report.overlaySlots.every((s) => s.passed)).toBe(true);
  });

  it("marks task-1 through task-115 done when roles are complete", () => {
    const tracker = JSON.parse(readFileSync(TRACKER_PATH, "utf8")) as Record<string, string>;
    const reconciled = applyExecutionTrackerReconciliation(tracker);
    for (let slot = 1; slot <= 115; slot += 1) {
      expect(reconciled[`task-${slot}`], `task-${slot}`).toBe("done");
    }
  });

  it("passes live tracker after persisted reconciliation", () => {
    const report = auditExecutionTrackerReconciliation();
    expect(report.passed).toBe(true);
  });
});

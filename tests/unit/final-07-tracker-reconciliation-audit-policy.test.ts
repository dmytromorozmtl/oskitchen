import { describe, expect, it } from "vitest";

import {
  auditFinal07TrackerReconciliation,
  EXEC_02_CANONICAL_TASK_SLOT,
  FINAL_07_TRACKER_RECONCILIATION_POLICY_ID,
} from "@/lib/execution/final-07-tracker-reconciliation-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import { EXECUTION_TRACKER_RECONCILIATION_POLICY_ID } from "@/lib/execution/execution-tracker-reconciliation-patterns";
import { EXECUTION_TRACKER_SLOT_COUNT } from "@/lib/execution/execution-tracker-slot-registry";

describe("final orchestrator FINAL-07 EXEC-02 tracker reconciliation re-cert", () => {
  it("locks FINAL-07 policy and task slot 201", () => {
    expect(FINAL_07_TRACKER_RECONCILIATION_POLICY_ID).toBe(
      "final-07-tracker-reconciliation-v1",
    );
    expect(FINAL_ORCHESTRATOR_PHASES[6]?.id).toBe("FINAL-07");
    expect(FINAL_ORCHESTRATOR_PHASES[6]?.taskSlot).toBe(201);
    expect(EXECUTION_TRACKER_RECONCILIATION_POLICY_ID).toBe(
      "execution-tracker-reconciliation-exec02-v1",
    );
    expect(EXECUTION_TRACKER_SLOT_COUNT).toBe(220);
    expect(EXEC_02_CANONICAL_TASK_SLOT).toBe(194);
  });

  it("passes EXEC-02 tracker reconciliation re-cert against repo", () => {
    const report = auditFinal07TrackerReconciliation();
    expect(report.passed).toBe(true);
    expect(report.reconciliationPassed).toBe(true);
    expect(report.unreconciledCount).toBe(0);
    expect(report.final06Passed).toBe(true);
  });

  it("requires slot registry, EXEC-02 audit surfaces, and unit tests", () => {
    const report = auditFinal07TrackerReconciliation();
    expect(report.exec02PolicyPresent).toBe(true);
    expect(report.slotRegistryHonest).toBe(true);
    expect(report.unitTestsPresent).toBe(true);
    expect(report.exec02RoleDone).toBe(true);
    expect(report.exec02TaskSlotsDone).toBe(true);
  });

  it("enforces zero unreconciled task slots through task-193 and overlay capstones", () => {
    const report = auditFinal07TrackerReconciliation();
    expect(report.unreconciledCount).toBe(0);
    expect(report.reconciliationPassed).toBe(true);
  });
});

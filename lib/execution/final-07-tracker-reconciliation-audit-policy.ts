import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditFinal06ProgramCapstone } from "@/lib/execution/final-06-program-capstone-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import { auditExecutionTrackerReconciliation } from "@/lib/execution/execution-tracker-reconciliation-audit-policy";
import {
  EXECUTION_TRACKER_RECONCILIATION_ARTIFACT,
  EXECUTION_TRACKER_RECONCILIATION_POLICY_ID,
  EXECUTION_TRACKER_RECONCILIATION_PREREQUISITE_POLICY_ID,
} from "@/lib/execution/execution-tracker-reconciliation-patterns";
import { taskSlotKey } from "@/lib/execution/execution-tracker-slot-registry";

/**
 * FINAL-07 — EXEC-02 execution tracker reconciliation re-cert (220 slots).
 */

export const FINAL_07_TRACKER_RECONCILIATION_POLICY_ID =
  "final-07-tracker-reconciliation-v1" as const;

export const EXECUTION_TRACKER_RECONCILIATION_AUDIT_POLICY_PATH =
  "lib/execution/execution-tracker-reconciliation-audit-policy.ts" as const;

export const EXECUTION_TRACKER_SLOT_REGISTRY_PATH =
  "lib/execution/execution-tracker-slot-registry.ts" as const;

export const EXECUTION_TRACKER_RECONCILIATION_UNIT_TEST_PATH =
  "tests/unit/execution-tracker-reconciliation-audit-policy.test.ts" as const;

export const EXEC_02_CANONICAL_TASK_SLOT = 194 as const;

export type Final07TrackerReconciliationAuditReport = {
  policyId: typeof FINAL_07_TRACKER_RECONCILIATION_POLICY_ID;
  phaseId: "FINAL-07";
  taskSlot: number;
  exec02PolicyPresent: boolean;
  slotRegistryHonest: boolean;
  reconciliationPassed: boolean;
  unreconciledCount: number;
  exec02RoleDone: boolean;
  exec02TaskSlotsDone: boolean;
  unitTestsPresent: boolean;
  final06Passed: boolean;
  passed: boolean;
};

function readTracker(root: string): Record<string, string> {
  return JSON.parse(
    readFileSync(join(root, EXECUTION_TRACKER_RECONCILIATION_ARTIFACT), "utf8"),
  ) as Record<string, string>;
}

function auditSlotRegistry(root: string): boolean {
  const source = readFileSync(join(root, EXECUTION_TRACKER_SLOT_REGISTRY_PATH), "utf8");
  return (
    source.includes("EXECUTION_TRACKER_SLOT_COUNT = 220") &&
    source.includes("resolveRoleIdForTaskSlot") &&
    source.includes("listReconciliationTaskSlots") &&
    source.includes("EXECUTION_TRACKER_RECONCILIATION_SLOT_END = 193")
  );
}

export function auditFinal07TrackerReconciliation(
  root = process.cwd(),
): Final07TrackerReconciliationAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[6]!;
  const exec02PolicyPresent =
    existsSync(join(root, "lib/execution/execution-tracker-reconciliation-patterns.ts")) &&
    existsSync(join(root, EXECUTION_TRACKER_RECONCILIATION_AUDIT_POLICY_PATH));
  const slotRegistryHonest = existsSync(join(root, EXECUTION_TRACKER_SLOT_REGISTRY_PATH)) &&
    auditSlotRegistry(root);
  const unitTestsPresent = existsSync(join(root, EXECUTION_TRACKER_RECONCILIATION_UNIT_TEST_PATH));

  const reconciliation = auditExecutionTrackerReconciliation(root);
  const reconciliationPassed = reconciliation.passed;
  const unreconciledCount = reconciliation.unreconciledCount;

  const tracker = readTracker(root);
  const exec02RoleDone = tracker["EXEC-02"] === "done";
  const exec02TaskSlotsDone =
    tracker[taskSlotKey(182)] === "done" &&
    tracker[taskSlotKey(EXEC_02_CANONICAL_TASK_SLOT)] === "done";

  const patternsSource = readFileSync(
    join(root, "lib/execution/execution-tracker-reconciliation-patterns.ts"),
    "utf8",
  );
  const prerequisiteHonest =
    patternsSource.includes(EXECUTION_TRACKER_RECONCILIATION_PREREQUISITE_POLICY_ID) &&
    reconciliation.prerequisitePassed;

  const final06Passed = auditFinal06ProgramCapstone(root).passed;

  const passed =
    exec02PolicyPresent &&
    slotRegistryHonest &&
    reconciliationPassed &&
    unreconciledCount === 0 &&
    exec02RoleDone &&
    exec02TaskSlotsDone &&
    unitTestsPresent &&
    prerequisiteHonest &&
    final06Passed;

  return {
    policyId: FINAL_07_TRACKER_RECONCILIATION_POLICY_ID,
    phaseId: "FINAL-07",
    taskSlot: phase.taskSlot,
    exec02PolicyPresent,
    slotRegistryHonest,
    reconciliationPassed,
    unreconciledCount,
    exec02RoleDone,
    exec02TaskSlotsDone,
    unitTestsPresent,
    final06Passed,
    passed,
  };
}

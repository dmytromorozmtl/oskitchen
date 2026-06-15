import { describe, expect, it } from "vitest";

import { auditProgramClosure } from "@/lib/execution/audit-program-closure";
import { PROGRAM_CLOSURE_POLICY_ID } from "@/lib/execution/program-closure-policy";
import { CANONICAL_TASK_SLOT_COUNT } from "@/lib/execution/tracker-preclosure-policy";

describe("program closure — FINAL-26", () => {
  it("reports closure state from execution tracker", () => {
    const report = auditProgramClosure();
    expect(report.policyId).toBe(PROGRAM_CLOSURE_POLICY_ID);
    expect(report.phaseId).toBe("FINAL-26");
    expect(report.taskSlot).toBe(220);
    expect(report.canonicalSlotsTotal).toBe(CANONICAL_TASK_SLOT_COUNT);
    expect(report.trackerPresent).toBe(true);
  });
});

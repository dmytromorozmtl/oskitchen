import { describe, expect, it } from "vitest";

import {
  buildPilotRollbackDrillSummary,
  resolvePilotRollbackProofStatus,
} from "@/lib/commercial/pilot-rollback-drill-summary";

describe("pilot rollback drill summary", () => {
  it("marks proof skipped when no steps passed", () => {
    const summary = buildPilotRollbackDrillSummary({ drillMode: "unset" });
    expect(summary.rollbackProofStatus).toBe("proof_skipped_missing_prerequisites");
  });

  it("marks proof passed when all six steps pass", () => {
    const summary = buildPilotRollbackDrillSummary({
      drillMode: "tabletop",
      operatorEmail: "ops@example.com",
      stepStatuses: {
        1: "PASSED",
        2: "PASSED",
        3: "PASSED",
        4: "PASSED",
        5: "PASSED",
        6: "PASSED",
      },
      retrospectiveOutcome: "Completed tabletop in 30 min",
    });
    expect(summary.rollbackProofStatus).toBe("proof_passed");
    expect(summary.retrospective.recorded).toBe(true);
  });

  it("marks proof failed when any step fails", () => {
    const steps = [
      { order: 1, action: "a", owner: "o", status: "PASSED" as const },
      { order: 2, action: "b", owner: "o", status: "FAILED" as const },
    ];
    expect(resolvePilotRollbackProofStatus(steps)).toBe("proof_failed");
  });
});

import { describe, expect, it } from "vitest";

import {
  auditFinal26ProgramClosure,
  FINAL_26_PROGRAM_CLOSURE_POLICY_ID,
} from "@/lib/execution/final-26-program-closure-audit-policy";
import {
  PROGRAM_CLOSURE_FINAL_DOC,
  PROGRAM_CLOSURE_RUNNER_SCRIPT,
  PROGRAM_CLOSURE_SUMMARY_ARTIFACT,
} from "@/lib/execution/program-closure-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

describe("final orchestrator FINAL-26 program closure audit", () => {
  it("locks FINAL-26 policy and task slot 220", () => {
    expect(FINAL_26_PROGRAM_CLOSURE_POLICY_ID).toBe("final-26-all-tasks-done-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[25]?.id).toBe("FINAL-26");
    expect(FINAL_ORCHESTRATOR_PHASES[25]?.taskSlot).toBe(220);
    expect(PROGRAM_CLOSURE_SUMMARY_ARTIFACT).toBe("artifacts/program-closure-summary.json");
    expect(PROGRAM_CLOSURE_FINAL_DOC).toBe("docs/final-execution-report.md");
    expect(PROGRAM_CLOSURE_RUNNER_SCRIPT).toBe("scripts/ops/run-program-closure.ts");
  });

  it("passes when tracker is fully closed and closure artifact is PASS", () => {
    const report = auditFinal26ProgramClosure();
    expect(report.closurePassed).toBe(true);
    expect(report.passed).toBe(true);
  });
});

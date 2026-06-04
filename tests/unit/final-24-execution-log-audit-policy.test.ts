import { describe, expect, it } from "vitest";

import {
  auditExecutionLogRegistry,
  auditFinal24ExecutionLog,
  FINAL_24_EXECUTION_LOG_POLICY_ID,
} from "@/lib/execution/final-24-execution-log-audit-policy";
import {
  EXECUTION_LOG_CONTINUITY_SUMMARY_ARTIFACT,
  EXECUTION_LOG_RUNNER_SCRIPT,
} from "@/lib/execution/execution-log-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

describe("final orchestrator FINAL-24 execution log audit", () => {
  it("locks FINAL-24 policy and task slot 218", () => {
    expect(FINAL_24_EXECUTION_LOG_POLICY_ID).toBe("final-24-execution-log-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[23]?.id).toBe("FINAL-24");
    expect(FINAL_ORCHESTRATOR_PHASES[23]?.taskSlot).toBe(218);
    expect(EXECUTION_LOG_CONTINUITY_SUMMARY_ARTIFACT).toBe(
      "artifacts/execution-log-continuity-summary.json",
    );
    expect(EXECUTION_LOG_RUNNER_SCRIPT).toBe(
      "scripts/ops/run-execution-log-continuity-audit.ts",
    );
  });

  it("registers execution log continuity through cycle 213", () => {
    expect(auditExecutionLogRegistry()).toBe(true);
  });

  it("passes log audit when artifact is honest PASS", () => {
    const report = auditFinal24ExecutionLog();
    expect(report.final23Passed).toBe(true);
    expect(report.continuityHonest).toBe(true);
    expect(report.passed).toBe(true);
  });
});

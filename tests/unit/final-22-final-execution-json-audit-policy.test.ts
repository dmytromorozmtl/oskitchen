import { describe, expect, it } from "vitest";

import {
  auditFinal22FinalExecutionJson,
  FINAL_22_FINAL_EXECUTION_JSON_POLICY_ID,
} from "@/lib/execution/final-22-final-execution-json-audit-policy";
import {
  FINAL_EXECUTION_JSON_RUNNER_SCRIPT,
  FINAL_EXECUTION_JSON_SYNC_SUMMARY_ARTIFACT,
  FINAL_EXECUTION_REPORT_ARTIFACT,
} from "@/lib/execution/final-execution-json-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

describe("final orchestrator FINAL-22 final execution JSON audit", () => {
  it("locks FINAL-22 policy and task slot 216", () => {
    expect(FINAL_22_FINAL_EXECUTION_JSON_POLICY_ID).toBe("final-22-final-execution-json-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[21]?.id).toBe("FINAL-22");
    expect(FINAL_ORCHESTRATOR_PHASES[21]?.taskSlot).toBe(216);
    expect(FINAL_EXECUTION_REPORT_ARTIFACT).toBe("artifacts/final-execution-report.json");
    expect(FINAL_EXECUTION_JSON_SYNC_SUMMARY_ARTIFACT).toBe(
      "artifacts/final-execution-json-sync-summary.json",
    );
    expect(FINAL_EXECUTION_JSON_RUNNER_SCRIPT).toBe(
      "scripts/ops/run-final-execution-json-sync.ts",
    );
  });

  it("passes JSON sync audit when artifacts are honest PASS", () => {
    const report = auditFinal22FinalExecutionJson();
    expect(report.reportSchemaValid).toBe(true);
    expect(report.final21Passed).toBe(true);
    expect(report.syncHonest).toBe(true);
    expect(report.passed).toBe(true);
  });
});

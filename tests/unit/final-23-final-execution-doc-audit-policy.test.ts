import { describe, expect, it } from "vitest";

import {
  auditFinal23FinalExecutionDoc,
  auditFinalExecutionDocRegistry,
  FINAL_23_FINAL_EXECUTION_DOC_POLICY_ID,
} from "@/lib/execution/final-23-final-execution-doc-audit-policy";
import {
  FINAL_EXECUTION_DOC_RUNNER_SCRIPT,
  FINAL_EXECUTION_DOC_SYNC_SUMMARY_ARTIFACT,
} from "@/lib/execution/final-execution-doc-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

describe("final orchestrator FINAL-23 final execution doc audit", () => {
  it("locks FINAL-23 policy and task slot 217", () => {
    expect(FINAL_23_FINAL_EXECUTION_DOC_POLICY_ID).toBe("final-23-final-execution-doc-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[22]?.id).toBe("FINAL-23");
    expect(FINAL_ORCHESTRATOR_PHASES[22]?.taskSlot).toBe(217);
    expect(FINAL_EXECUTION_DOC_SYNC_SUMMARY_ARTIFACT).toBe(
      "artifacts/final-execution-doc-sync-summary.json",
    );
    expect(FINAL_EXECUTION_DOC_RUNNER_SCRIPT).toBe(
      "scripts/ops/run-final-execution-doc-sync.ts",
    );
  });

  it("registers doc markers aligned with JSON snapshot", () => {
    expect(auditFinalExecutionDocRegistry()).toBe(true);
  });

  it("passes doc audit when artifact is honest PASS", () => {
    const report = auditFinal23FinalExecutionDoc();
    expect(report.jsonReportPresent).toBe(true);
    expect(report.final22Passed).toBe(true);
    expect(report.docHonest).toBe(true);
    expect(report.passed).toBe(true);
  });
});

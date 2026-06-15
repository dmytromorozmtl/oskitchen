import { describe, expect, it } from "vitest";

import {
  auditCommercialPilotRunbookRegistry,
  auditFinal21CommercialPilotRunbook,
  FINAL_21_COMMERCIAL_PILOT_RUNBOOK_POLICY_ID,
} from "@/lib/execution/final-21-commercial-pilot-runbook-audit-policy";
import {
  COMMERCIAL_PILOT_RUNBOOK_FINAL_RUNNER_SCRIPT,
  COMMERCIAL_PILOT_RUNBOOK_FINAL_SUMMARY_ARTIFACT,
} from "@/lib/execution/commercial-pilot-runbook-final-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

describe("final orchestrator FINAL-21 commercial pilot runbook audit", () => {
  it("locks FINAL-21 policy and task slot 215", () => {
    expect(FINAL_21_COMMERCIAL_PILOT_RUNBOOK_POLICY_ID).toBe(
      "final-21-commercial-pilot-runbook-v1",
    );
    expect(FINAL_ORCHESTRATOR_PHASES[20]?.id).toBe("FINAL-21");
    expect(FINAL_ORCHESTRATOR_PHASES[20]?.taskSlot).toBe(215);
    expect(COMMERCIAL_PILOT_RUNBOOK_FINAL_SUMMARY_ARTIFACT).toBe(
      "artifacts/commercial-pilot-runbook-summary.json",
    );
    expect(COMMERCIAL_PILOT_RUNBOOK_FINAL_RUNNER_SCRIPT).toBe(
      "scripts/ops/run-commercial-pilot-runbook-audit.ts",
    );
  });

  it("registers era7 runbook sections and FINAL-21 markers", () => {
    expect(auditCommercialPilotRunbookRegistry()).toBe(true);
  });

  it("passes runbook audit when artifact is honest PASS", () => {
    const report = auditFinal21CommercialPilotRunbook();
    expect(report.runbookRegistryHonest).toBe(true);
    expect(report.final20Passed).toBe(true);
    expect(report.runbookHonest).toBe(true);
    expect(report.passed).toBe(true);
  });
});

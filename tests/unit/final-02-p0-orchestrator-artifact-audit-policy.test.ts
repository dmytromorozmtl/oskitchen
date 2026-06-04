import { describe, expect, it } from "vitest";

import {
  auditFinal02P0OrchestratorArtifact,
  FINAL_02_P0_ORCHESTRATOR_ARTIFACT_POLICY_ID,
  P0_ORCHESTRATOR_REQUIRED_STEP_IDS,
  P0_ORCHESTRATOR_STAGING_RUN_ARTIFACT,
} from "@/lib/execution/final-02-p0-orchestrator-artifact-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

describe("final orchestrator FINAL-02 P0 orchestrator artifact audit", () => {
  it("locks FINAL-02 policy and task slot 196", () => {
    expect(FINAL_02_P0_ORCHESTRATOR_ARTIFACT_POLICY_ID).toBe(
      "final-02-p0-orchestrator-artifact-v1",
    );
    expect(FINAL_ORCHESTRATOR_PHASES[1]?.id).toBe("FINAL-02");
    expect(FINAL_ORCHESTRATOR_PHASES[1]?.taskSlot).toBe(196);
    expect(P0_ORCHESTRATOR_STAGING_RUN_ARTIFACT).toBe(
      "artifacts/p0-orchestrator-staging-run-summary.json",
    );
    expect(P0_ORCHESTRATOR_REQUIRED_STEP_IDS).toHaveLength(7);
  });

  it("passes P0 orchestrator artifact audit against repo", () => {
    const report = auditFinal02P0OrchestratorArtifact();
    expect(report.passed).toBe(true);
    expect(report.artifactPresent).toBe(true);
    expect(report.artifactSchemaValid).toBe(true);
    expect(report.final01Passed).toBe(true);
    expect(report.honestOverall).toBe(true);
  });

  it("requires GHA workflow and local staging runner script", () => {
    const report = auditFinal02P0OrchestratorArtifact();
    expect(report.workflowPresent).toBe(true);
    expect(report.runnerScriptPresent).toBe(true);
  });

  it("accepts honest FAIL overall without inflating to PASS", () => {
    const report = auditFinal02P0OrchestratorArtifact();
    expect(report.honestOverall).toBe(true);
    expect(report.passed).toBe(true);
  });
});

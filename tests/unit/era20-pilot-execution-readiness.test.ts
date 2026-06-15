import { describe, expect, it } from "vitest";

import {
  buildEra20PilotExecutionReadinessSlice,
  derivePilotMetricsBaselineGate,
  derivePilotRollbackDrillGate,
} from "@/lib/commercial/era20-pilot-execution-readiness";
import { ERA20_PILOT_EXECUTION_READINESS_POLICY_ID } from "@/lib/commercial/era20-pilot-execution-readiness-policy";
import { buildPilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";

describe("era20-pilot-execution-readiness", () => {
  it("locks era20 execution readiness policy id", () => {
    expect(ERA20_PILOT_EXECUTION_READINESS_POLICY_ID).toBe(
      "era20-pilot-execution-readiness-v1",
    );
  });

  it("marks rollback drill passed when artifact proof_passed", () => {
    const gate = derivePilotRollbackDrillGate({
      rollbackProofStatus: "proof_passed",
      drillMode: "tabletop",
      passedStepCount: 5,
      totalSteps: 5,
    });
    expect(gate.pass).toBe(true);
  });

  it("marks metrics baseline missing when artifact SKIPPED", () => {
    const gate = derivePilotMetricsBaselineGate({
      overall: "SKIPPED",
      baselineProofStatus: "proof_skipped_missing_pilot_data",
      capturedCount: 0,
      missingCount: 6,
    });
    expect(gate.pass).toBe(false);
  });

  it("builds support checklist from gate signals", () => {
    const slice = buildEra20PilotExecutionReadinessSlice({
      metricsBaseline: { overall: "SKIPPED" },
      rollbackDrill: { rollbackProofStatus: "proof_passed", passedStepCount: 5, totalSteps: 5 },
      goNoGoArtifactPresent: true,
      forbiddenClaimsPassed: true,
      p0ProofPassed: false,
    });
    expect(slice.rollbackGate.pass).toBe(true);
    expect(slice.supportChecklist.find((row) => row.id === "rollback_drill_passed")?.status).toBe(
      "done",
    );
    expect(slice.supportChecklist.find((row) => row.id === "p0_staging_proof_passed")?.status).toBe(
      "pending",
    );
  });
});

describe("era20-pilot-gono-go-execution-readiness", () => {
  it("adds execution readiness warnings without faking GO", () => {
    const summary = buildPilotGoNoGoSummary({
      preflight: { tier0ProofStatus: "proof_passed", tier1ProofStatus: "proof_skipped" },
      goldenPath: null,
      forbiddenClaimsEnforcement: {
        overall: "PASSED",
        claimsEnforcementProofStatus: "proof_passed",
      },
      p0StagingProof: { p0ProofStatus: "awaiting_ops_credentials", overall: "SKIPPED" },
      ssoPilotReadyGate: null,
      metricsBaseline: { overall: "SKIPPED", baselineProofStatus: "proof_skipped_missing_pilot_data" },
      rollbackDrill: { rollbackProofStatus: "proof_passed", passedStepCount: 5, totalSteps: 5 },
      icpInput: {},
    });
    expect(summary.decision).toBe("NO-GO");
    expect(summary.executionReadiness?.rollbackGate.pass).toBe(true);
    expect(
      summary.warnings.some((warning) => warning.includes("metrics baseline not captured")),
    ).toBe(true);
  });
});

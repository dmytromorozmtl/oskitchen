import { describe, expect, it } from "vitest";

import {
  buildPilotScaleExpansionExecutionGates,
  buildPilotScaleExpansionExecutionSummary,
  resolvePilotScaleExpansionExecutionMilestone,
} from "@/lib/ops/pilot-scale-expansion-execution-orchestrator";
import {
  buildPilotScaleExpansionPhaseStatuses,
  resolvePilotScaleExpansionWeekPhasesComplete,
} from "@/lib/ops/pilot-scale-expansion-execution-phases";
import { evaluateScaleReadinessEnv } from "@/scripts/ops/validate-scale-readiness-env";

const COMPLETE_WEEK_ENV: NodeJS.ProcessEnv = {
  PILOT_SCALE_WEEK2_OPS_REVIEWED: "1",
  PILOT_SCALE_WEEK3_METRICS_REVIEWED: "1",
  PILOT_SCALE_WEEK4_EXPANSION_READINESS: "1",
  PILOT_SCALE_EXPANSION_LOI_SIGNED_DATE: "2026-06-01",
  PILOT_SCALE_EXPANSION_SCOPE: "restaurant expansion — second location",
  PILOT_SCALE_MATURITY_MATRIX_REVIEWED: "1",
};

describe("pilot-scale-expansion-execution-orchestrator", () => {
  it("resolves week1_execution_blocked before week phases", () => {
    const weekPhases = buildPilotScaleExpansionPhaseStatuses({ metricsBaselinePassed: false });
    expect(
      resolvePilotScaleExpansionExecutionMilestone({
        week1ExecutionPassed: false,
        weekPhases,
        scaleEvaluation: evaluateScaleReadinessEnv({}),
        scaleIntegrityPassed: true,
      }),
    ).toBe("week1_execution_blocked");
  });

  it("resolves awaiting_week2 when week1 passed but phases incomplete", () => {
    const weekPhases = buildPilotScaleExpansionPhaseStatuses({ metricsBaselinePassed: false });
    expect(
      resolvePilotScaleExpansionExecutionMilestone({
        week1ExecutionPassed: true,
        weekPhases,
        scaleEvaluation: evaluateScaleReadinessEnv({}),
        scaleIntegrityPassed: true,
      }),
    ).toBe("awaiting_week2_daily_ops");
  });

  it("resolves pilot_scale_expansion_passed when scale complete and integrity pass", () => {
    const weekPhases = buildPilotScaleExpansionPhaseStatuses({
      metricsBaselinePassed: true,
      env: COMPLETE_WEEK_ENV,
    });
    const scaleEvaluation = {
      ...evaluateScaleReadinessEnv({}),
      scaleComplete: true,
      scaleMilestone: "scale_complete" as const,
    };
    expect(
      resolvePilotScaleExpansionExecutionMilestone({
        week1ExecutionPassed: true,
        weekPhases,
        scaleEvaluation,
        scaleIntegrityPassed: true,
      }),
    ).toBe("pilot_scale_expansion_passed");
  });

  it("never reports pilot_scale_expansion_passed when week1 blocked", () => {
    const summary = buildPilotScaleExpansionExecutionSummary({
      week1Execution: {
        version: "pilot-week1-execution-v1",
        policyId: "era33-pilot-week1-execution-v1",
        generatedAt: "2026-05-29T00:00:00.000Z",
        milestone: "commercial_gate_blocked",
        commercialGateMilestone: "tier2_execution_blocked",
        goDecision: "NO-GO",
        customerName: null,
        week1Complete: false,
        readyForDay5Smokes: false,
        operatorGoldenPathProofStatus: null,
        rollbackDrillProofStatus: null,
        week1IntegrityPassed: false,
        csSignoffComplete: false,
        phases: [],
        gates: [],
        nextPhase: null,
        recommendedCommands: [],
        productSurfaces: [],
        honestyNote: "test",
      },
    });
    expect(summary.milestone).toBe("week1_execution_blocked");
    expect(summary.milestone).not.toBe("pilot_scale_expansion_passed");
  });

  it("builds seven execution gates", () => {
    const gates = buildPilotScaleExpansionExecutionGates({
      week1ExecutionPassed: false,
      week1ExecutionMilestone: "commercial_gate_blocked",
      weekPhasesComplete: false,
      metricsBaselinePassed: false,
      scaleComplete: false,
      scaleIntegrityPassed: true,
      commercialInflectionMilestone: "p0_ops_vault_blocked",
      goDecision: "NO-GO",
    });
    expect(gates).toHaveLength(7);
    expect(gates.find((g) => g.id === "week1_execution")?.complete).toBe(false);
  });

  it("week phase completion requires blocking phases only", () => {
    const phases = buildPilotScaleExpansionPhaseStatuses({ metricsBaselinePassed: false });
    expect(resolvePilotScaleExpansionWeekPhasesComplete(phases)).toBe(false);
    const complete = buildPilotScaleExpansionPhaseStatuses({
      metricsBaselinePassed: true,
      env: COMPLETE_WEEK_ENV,
    });
    expect(resolvePilotScaleExpansionWeekPhasesComplete(complete)).toBe(true);
  });
});

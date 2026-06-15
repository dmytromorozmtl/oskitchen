import { describe, expect, it } from "vitest";

import {
  buildProductionGaExecutionGates,
  buildProductionGaExecutionSummary,
  resolveProductionGaExecutionMilestone,
} from "@/lib/ops/production-ga-execution-orchestrator";
import {
  buildProductionGaPhaseStatuses,
  resolveProductionGaPhasesComplete,
} from "@/lib/ops/production-ga-execution-phases";

const COMPLETE_GA_ENV: NodeJS.ProcessEnv = {
  PRODUCTION_GA_ENGINEERING_GATES_REVIEWED: "1",
  PRODUCTION_GA_OPS_RUNBOOK_REVIEWED: "1",
  PRODUCTION_GA_CRON_MONITORING_REVIEWED: "1",
  PRODUCTION_GA_ROLLBACK_PATH_REVIEWED: "1",
  PRODUCTION_GA_SECURITY_REVIEW_REVIEWED: "1",
  SCALE_SOC2_READINESS_TRACK_REVIEWED: "1",
  PRODUCTION_GA_PRICING_PACKAGING_REVIEWED: "1",
  PRODUCTION_GA_ICP_ALL_FB_FORMATS_FINALIZED: "1",
  PRODUCTION_GA_LAUNCH_NARRATIVE_REVIEWED: "1",
};

describe("production-ga-execution-orchestrator", () => {
  it("resolves scale_expansion_blocked before GA phases", () => {
    const phases = buildProductionGaPhaseStatuses({
      p0ProofPassed: false,
      tier2ProofPassed: false,
      scaleComplete: false,
      rollbackDrillPassed: false,
      investorOnepagerPassed: false,
      forbiddenClaimsPassed: false,
    });
    expect(
      resolveProductionGaExecutionMilestone({
        scaleExpansionPassed: false,
        gaPhases: phases,
        scaleIntegrityPassed: true,
        commercialInflectionMilestone: "commercial_inflection_ready",
      }),
    ).toBe("scale_expansion_blocked");
  });

  it("resolves awaiting_engineering_gates when scale expansion passed but phases incomplete", () => {
    const phases = buildProductionGaPhaseStatuses({
      p0ProofPassed: false,
      tier2ProofPassed: false,
      scaleComplete: false,
      rollbackDrillPassed: false,
      investorOnepagerPassed: false,
      forbiddenClaimsPassed: false,
    });
    expect(
      resolveProductionGaExecutionMilestone({
        scaleExpansionPassed: true,
        gaPhases: phases,
        scaleIntegrityPassed: true,
        commercialInflectionMilestone: "commercial_inflection_ready",
      }),
    ).toBe("awaiting_engineering_gates");
  });

  it("resolves production_ga_passed when all gates pass", () => {
    const phases = buildProductionGaPhaseStatuses({
      p0ProofPassed: true,
      tier2ProofPassed: true,
      scaleComplete: true,
      rollbackDrillPassed: true,
      investorOnepagerPassed: true,
      forbiddenClaimsPassed: true,
      env: COMPLETE_GA_ENV,
    });
    expect(
      resolveProductionGaExecutionMilestone({
        scaleExpansionPassed: true,
        gaPhases: phases,
        scaleIntegrityPassed: true,
        commercialInflectionMilestone: "commercial_inflection_ready",
      }),
    ).toBe("production_ga_passed");
  });

  it("never reports production_ga_passed when scale expansion blocked", () => {
    const summary = buildProductionGaExecutionSummary({
      scaleExpansion: {
        version: "pilot-scale-expansion-execution-v1",
        policyId: "era34-pilot-scale-expansion-execution-v1",
        generatedAt: "2026-05-29T00:00:00.000Z",
        milestone: "week1_execution_blocked",
        week1ExecutionMilestone: "commercial_gate_blocked",
        goDecision: "NO-GO",
        customerName: null,
        weekPhasesComplete: false,
        scaleComplete: false,
        month2Complete: false,
        scaleIntegrityPassed: false,
        commercialInflectionMilestone: "p0_ops_vault_blocked",
        pilotExecutableScore: 24,
        phases: [],
        scalePhases: [],
        gates: [],
        nextPhase: null,
        recommendedCommands: [],
        productSurfaces: [],
        honestyNote: "test",
      },
    });
    expect(summary.milestone).toBe("scale_expansion_blocked");
    expect(summary.milestone).not.toBe("production_ga_passed");
  });

  it("builds seven execution gates", () => {
    const gates = buildProductionGaExecutionGates({
      scaleExpansionPassed: false,
      scaleExpansionMilestone: "week1_execution_blocked",
      gaPhasesComplete: false,
      p0ProofPassed: false,
      tier2ProofPassed: false,
      scaleComplete: false,
      scaleIntegrityPassed: true,
      commercialInflectionMilestone: "p0_ops_vault_blocked",
      goDecision: "NO-GO",
      rollbackDrillPassed: false,
    });
    expect(gates).toHaveLength(7);
    expect(gates.find((g) => g.id === "scale_expansion")?.complete).toBe(false);
  });

  it("GA phase completion requires blocking phases only", () => {
    const phases = buildProductionGaPhaseStatuses({
      p0ProofPassed: false,
      tier2ProofPassed: false,
      scaleComplete: false,
      rollbackDrillPassed: false,
      investorOnepagerPassed: false,
      forbiddenClaimsPassed: false,
    });
    expect(resolveProductionGaPhasesComplete(phases)).toBe(false);
    const complete = buildProductionGaPhaseStatuses({
      p0ProofPassed: true,
      tier2ProofPassed: true,
      scaleComplete: true,
      rollbackDrillPassed: true,
      investorOnepagerPassed: true,
      forbiddenClaimsPassed: true,
      env: COMPLETE_GA_ENV,
    });
    expect(resolveProductionGaPhasesComplete(complete)).toBe(true);
  });
});

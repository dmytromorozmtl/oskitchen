import { describe, expect, it } from "vitest";

import {
  buildPilotWeek1ExecutionGates,
  buildPilotWeek1ExecutionOrchestratorSummary,
  isCheckpointSmokesPassed,
  isCsSignoffComplete,
  resolvePilotWeek1ExecutionOrchestratorMilestone,
} from "@/lib/ops/pilot-week1-execution-orchestrator";
import { evaluatePilotWeek1Env } from "@/scripts/ops/validate-pilot-week1-env";

describe("pilot-week1-execution-orchestrator", () => {
  it("resolves commercial_gate_blocked before week1 milestones", () => {
    expect(
      resolvePilotWeek1ExecutionOrchestratorMilestone({
        commercialGatePassed: false,
        week1Evaluation: evaluatePilotWeek1Env({}),
        checkpointSmokesPassed: false,
        csSignoffComplete: false,
        week1IntegrityPassed: true,
      }),
    ).toBe("commercial_gate_blocked");
  });

  it("requires checkpoint smokes after week1 day phases complete", () => {
    const week1Evaluation = {
      prerequisites: { goDecision: "GO", prerequisitesComplete: true },
      week1Complete: true,
      week1Milestone: "week1_complete" as const,
      readyForDay5Smokes: true,
      goDecision: "GO",
      present: [],
      missing: [],
      phases: [],
    };
    expect(
      resolvePilotWeek1ExecutionOrchestratorMilestone({
        commercialGatePassed: true,
        week1Evaluation,
        checkpointSmokesPassed: false,
        csSignoffComplete: false,
        week1IntegrityPassed: true,
      }),
    ).toBe("awaiting_checkpoint_smokes");
  });

  it("resolves week1_execution_passed only when all gates pass", () => {
    const week1Evaluation = {
      prerequisites: { goDecision: "GO", prerequisitesComplete: true },
      week1Complete: true,
      week1Milestone: "week1_complete" as const,
      readyForDay5Smokes: true,
      goDecision: "GO",
      present: [],
      missing: [],
      phases: [],
    };
    expect(
      resolvePilotWeek1ExecutionOrchestratorMilestone({
        commercialGatePassed: true,
        week1Evaluation,
        checkpointSmokesPassed: true,
        csSignoffComplete: true,
        week1IntegrityPassed: true,
      }),
    ).toBe("week1_execution_passed");
  });

  it("never reports week1_execution_passed when commercial gate blocked", () => {
    const summary = buildPilotWeek1ExecutionOrchestratorSummary({
      commercialGate: {
        version: "commercial-gate-execution-v1",
        policyId: "era32-commercial-gate-execution-v1",
        generatedAt: "2026-05-29T00:00:00.000Z",
        milestone: "tier2_execution_blocked",
        tier2ExecutionMilestone: "p0_blocked",
        p0ProofStatus: "awaiting_ops_credentials",
        tier2ProofStatus: null,
        tier2IntegrityPassed: true,
        p0IntegrityPassed: true,
        icpQualified: null,
        icpEnvConfigured: false,
        goDecision: "NO-GO",
        goIntegrityPassed: true,
        goBlockerCount: 6,
        commercialInflectionMilestone: "p0_ops_vault_blocked",
        pilotExecutableScore: 24,
        readyForGoOrchestrator: false,
        phases: [],
        gates: [],
        nextPhase: null,
        recommendedCommands: [],
        productSurfaces: [],
        honestyNote: "test",
      },
      goNoGo: {
        version: "era17-pilot-gono-go-v1",
        runAt: "2026-05-29T00:00:00.000Z",
        decision: "NO-GO",
        blockers: ["blocked"],
        warnings: [],
        customerExecutionStatus: "skipped_missing_customer",
        customerName: null,
        loiSignedDate: null,
        prospectExecutionStatus: "none",
        prospectName: null,
        icpQualification: { qualified: false, missingCriteria: [], disqualifiers: [] },
        evidenceGates: [],
        evaluatorInput: {
          tier0Pass: false,
          tier1Pass: false,
          tier2Pass: false,
          tier3Pass: false,
          roleChecklistsComplete: false,
          forbiddenClaimsInContract: false,
          icpQualified: false,
          stagingUrl: null,
          commitSha: null,
        },
      },
    });
    expect(summary.milestone).toBe("commercial_gate_blocked");
    expect(summary.milestone).not.toBe("week1_execution_passed");
  });

  it("detects checkpoint smokes and CS sign-off", () => {
    expect(
      isCheckpointSmokesPassed({
        operatorGoldenPath: { overall: "PASSED", phaseProofStatus: "proof_passed" },
        rollbackDrill: { rollbackProofStatus: "proof_passed" },
      }),
    ).toBe(true);
    expect(
      isCsSignoffComplete({
        PILOT_WEEK1_CHECKPOINT_DATE: "2026-06-05",
        PILOT_WEEK1_OPERATOR_SATISFACTION: "4",
      }),
    ).toBe(true);
  });

  it("builds seven execution gates with F&B honesty in note", () => {
    const gates = buildPilotWeek1ExecutionGates({
      commercialGatePassed: false,
      commercialGateMilestone: "tier2_execution_blocked",
      goDecision: "NO-GO",
      goIntegrityPassed: true,
      week1Complete: false,
      operatorGoldenPathProofStatus: null,
      rollbackDrillProofStatus: null,
      csSignoffComplete: false,
      week1IntegrityPassed: true,
    });
    expect(gates).toHaveLength(7);
    expect(gates.find((g) => g.id === "commercial_gate")?.complete).toBe(false);
  });
});

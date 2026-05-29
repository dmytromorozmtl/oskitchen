import { describe, expect, it } from "vitest";

import {
  buildProductionPilotReadyChainStepStatuses,
  buildProductionPilotReadyClosureExecutionGates,
  buildProductionPilotReadyClosureExecutionSummary,
  PRODUCTION_PILOT_READY_EXECUTION_CHAIN_STEPS,
  resolveProductionPilotReadyClosureExecutionMilestone,
} from "@/lib/ops/production-pilot-ready-closure-execution-orchestrator";

describe("production-pilot-ready-closure-execution-orchestrator", () => {
  it("resolves awaiting_p0_execution when chain blocked at P0", () => {
    expect(
      resolveProductionPilotReadyClosureExecutionMilestone({
        maintenanceModePassed: false,
        firstBlockedChainStep: { id: "p0" },
        chainComplete: false,
        vaultReady: false,
        engineeringPathTerminusHealthy: false,
        investorNarrativeReady: false,
        caseStudyApproved: false,
        perCustomerIsolation: false,
        goDecision: "NO-GO",
        forbiddenClaimsReviewed: false,
        engineeringPathTerminusIntegrityPassed: false,
      }),
    ).toBe("awaiting_p0_execution");
  });

  it("resolves maintenance_mode_blocked when only maintenance step incomplete", () => {
    expect(
      resolveProductionPilotReadyClosureExecutionMilestone({
        maintenanceModePassed: false,
        firstBlockedChainStep: { id: "maintenance_mode" },
        chainComplete: false,
        vaultReady: true,
        engineeringPathTerminusHealthy: true,
        investorNarrativeReady: true,
        caseStudyApproved: true,
        perCustomerIsolation: true,
        goDecision: "GO",
        forbiddenClaimsReviewed: true,
        engineeringPathTerminusIntegrityPassed: true,
      }),
    ).toBe("maintenance_mode_blocked");
  });

  it("resolves production_pilot_ready_passed when all gates satisfied", () => {
    expect(
      resolveProductionPilotReadyClosureExecutionMilestone({
        maintenanceModePassed: true,
        firstBlockedChainStep: null,
        chainComplete: true,
        vaultReady: true,
        engineeringPathTerminusHealthy: true,
        investorNarrativeReady: true,
        caseStudyApproved: true,
        perCustomerIsolation: true,
        goDecision: "GO",
        forbiddenClaimsReviewed: true,
        engineeringPathTerminusIntegrityPassed: true,
      }),
    ).toBe("production_pilot_ready_passed");
  });

  it("builds chain step statuses from artifact milestones", () => {
    const steps = buildProductionPilotReadyChainStepStatuses({
      artifacts: {
        p0: { milestone: "proof_passed" },
        tier2: { milestone: "proof_passed" },
        commercial_gate: null,
      },
    });
    expect(steps.find((step) => step.id === "p0")?.complete).toBe(true);
    expect(steps.find((step) => step.id === "tier2")?.complete).toBe(true);
    expect(steps.find((step) => step.id === "commercial_gate")?.complete).toBe(false);
    expect(steps.length).toBe(PRODUCTION_PILOT_READY_EXECUTION_CHAIN_STEPS.length);
  });

  it("builds twelve closure gates", () => {
    const gates = buildProductionPilotReadyClosureExecutionGates({
      maintenanceModePassed: false,
      maintenanceModeExecutionMilestone: "awaiting_rhythm_weekly",
      chainComplete: false,
      chainStepsPassed: 0,
      chainStepsTotal: 12,
      vaultReady: false,
      engineeringPathTerminusHealthy: false,
      engineeringPathTerminusMilestone: "awaiting_maintenance_mode",
      engineeringPathTerminusIntegrityPassed: false,
      investorNarrativeReady: false,
      caseStudyApproved: false,
      perCustomerIsolation: false,
      forbiddenClaimsReviewed: false,
      goDecision: "NO-GO",
      commercialInflectionMilestone: "p0_ops_vault_blocked",
      gateStepsComplete: false,
    });
    expect(gates.length).toBe(12);
    expect(gates.find((gate) => gate.id === "execution_chain")?.complete).toBe(false);
  });

  it("builds honest blocked summary from live repo state", () => {
    const summary = buildProductionPilotReadyClosureExecutionSummary({});
    expect(summary.version).toBe("production-pilot-ready-closure-execution-v1");
    expect(summary.policyId).toBe("era42-production-pilot-ready-closure-execution-v1");
    expect(summary.milestone).not.toBe("production_pilot_ready_passed");
    expect(summary.chainStepsTotal).toBe(12);
    expect(summary.gates.length).toBe(12);
  });
});

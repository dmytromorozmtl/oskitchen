import { describe, expect, it } from "vitest";

import {
  buildCommercialPilotPathAbsoluteEndLockExecutionGates,
  buildCommercialPilotPathAbsoluteEndLockExecutionSummary,
  resolveCommercialPilotPathAbsoluteEndLockExecutionMilestone,
} from "@/lib/ops/commercial-pilot-path-absolute-end-lock-execution-orchestrator";

describe("commercial-pilot-path-absolute-end-lock-execution-orchestrator", () => {
  it("resolves steady_state_operator_loop_blocked before absolute end", () => {
    expect(
      resolveCommercialPilotPathAbsoluteEndLockExecutionMilestone({
        steadyStateOperatorLoopPassed: false,
        absoluteEndActive: false,
        absoluteEndMilestone: "steady_state_blocked",
        pathComplete: false,
        gateStepsComplete: false,
        postTerminusSteadyStateIntegrityPassed: false,
        commercialPilotPathAbsoluteEndIntegrityPassed: false,
        linearPathPermanentlyClosedIntegrityPassed: false,
        perCustomerIsolation: false,
        absoluteEndReportPresent: false,
      }),
    ).toBe("steady_state_operator_loop_blocked");
  });

  it("resolves awaiting_absolute_end_active when upstream blocked", () => {
    expect(
      resolveCommercialPilotPathAbsoluteEndLockExecutionMilestone({
        steadyStateOperatorLoopPassed: true,
        absoluteEndActive: false,
        absoluteEndMilestone: "steady_state_blocked",
        pathComplete: false,
        gateStepsComplete: false,
        postTerminusSteadyStateIntegrityPassed: true,
        commercialPilotPathAbsoluteEndIntegrityPassed: true,
        linearPathPermanentlyClosedIntegrityPassed: true,
        perCustomerIsolation: true,
        absoluteEndReportPresent: true,
      }),
    ).toBe("awaiting_absolute_end_active");
  });

  it("resolves commercial_pilot_path_absolute_end_lock_passed when all gates satisfied", () => {
    expect(
      resolveCommercialPilotPathAbsoluteEndLockExecutionMilestone({
        steadyStateOperatorLoopPassed: true,
        absoluteEndActive: true,
        absoluteEndMilestone: "absolute_end_healthy",
        pathComplete: true,
        gateStepsComplete: true,
        postTerminusSteadyStateIntegrityPassed: true,
        commercialPilotPathAbsoluteEndIntegrityPassed: true,
        linearPathPermanentlyClosedIntegrityPassed: true,
        perCustomerIsolation: true,
        absoluteEndReportPresent: true,
      }),
    ).toBe("commercial_pilot_path_absolute_end_lock_passed");
  });

  it("resolves awaiting_absolute_end_path_closure when gate steps blocked", () => {
    expect(
      resolveCommercialPilotPathAbsoluteEndLockExecutionMilestone({
        steadyStateOperatorLoopPassed: true,
        absoluteEndActive: true,
        absoluteEndMilestone: "attention_path_closure",
        pathComplete: false,
        gateStepsComplete: false,
        postTerminusSteadyStateIntegrityPassed: true,
        commercialPilotPathAbsoluteEndIntegrityPassed: true,
        linearPathPermanentlyClosedIntegrityPassed: true,
        perCustomerIsolation: true,
        absoluteEndReportPresent: true,
      }),
    ).toBe("awaiting_absolute_end_path_closure");
  });

  it("builds twelve absolute end lock gates", () => {
    const gates = buildCommercialPilotPathAbsoluteEndLockExecutionGates({
      steadyStateOperatorLoopPassed: false,
      steadyStateOperatorLoopLockMilestone: "production_pilot_ready_blocked",
      absoluteEndActive: false,
      absoluteEndMilestone: "steady_state_blocked",
      pathComplete: false,
      gateStepsComplete: false,
      completedSteps: 0,
      totalSteps: 11,
      postTerminusSteadyStateIntegrityPassed: false,
      commercialPilotPathAbsoluteEndIntegrityPassed: false,
      linearPathPermanentlyClosedIntegrityPassed: false,
      absoluteEndReportPresent: false,
      perCustomerIsolation: false,
      goDecision: "NO-GO",
      commercialInflectionMilestone: "p0_ops_vault_blocked",
    });
    expect(gates.length).toBe(12);
    expect(gates.find((gate) => gate.id === "steady_state_operator_loop_lock")?.complete).toBe(
      false,
    );
  });

  it("builds honest blocked summary from live repo state", () => {
    const summary = buildCommercialPilotPathAbsoluteEndLockExecutionSummary({});
    expect(summary.version).toBe("commercial-pilot-path-absolute-end-lock-execution-v1");
    expect(summary.policyId).toBe("era44-commercial-pilot-path-absolute-end-lock-execution-v1");
    expect(summary.milestone).not.toBe("commercial_pilot_path_absolute_end_lock_passed");
    expect(summary.gates.length).toBe(12);
    expect(summary.pathLayers.length).toBeGreaterThan(0);
  });
});

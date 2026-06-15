import { describe, expect, it } from "vitest";

import {
  buildSteadyStateOperatorLoopLockExecutionGates,
  buildSteadyStateOperatorLoopLockExecutionSummary,
  resolveSteadyStateOperatorLoopLockExecutionMilestone,
} from "@/lib/ops/steady-state-operator-loop-lock-execution-orchestrator";

describe("steady-state-operator-loop-lock-execution-orchestrator", () => {
  it("resolves production_pilot_ready_blocked before steady state", () => {
    expect(
      resolveSteadyStateOperatorLoopLockExecutionMilestone({
        productionPilotReadyPassed: false,
        steadyStateActive: false,
        postTerminusSteadyStateMilestone: "engineering_terminus_blocked",
        overdueCount: 0,
        measurableTracksNeedAttention: false,
        postTerminusSteadyStateIntegrityPassed: false,
        perCustomerIsolation: false,
        eraCharterReviewed: false,
        era25OperatorLoopLockIntegrityPassed: false,
      }),
    ).toBe("production_pilot_ready_blocked");
  });

  it("resolves awaiting_post_terminus_steady_state when upstream blocked", () => {
    expect(
      resolveSteadyStateOperatorLoopLockExecutionMilestone({
        productionPilotReadyPassed: true,
        steadyStateActive: false,
        postTerminusSteadyStateMilestone: "maintenance_mode_blocked",
        overdueCount: 0,
        measurableTracksNeedAttention: false,
        postTerminusSteadyStateIntegrityPassed: false,
        perCustomerIsolation: true,
        eraCharterReviewed: true,
        era25OperatorLoopLockIntegrityPassed: true,
      }),
    ).toBe("awaiting_post_terminus_steady_state");
  });

  it("resolves steady_state_operator_loop_passed when all gates satisfied", () => {
    expect(
      resolveSteadyStateOperatorLoopLockExecutionMilestone({
        productionPilotReadyPassed: true,
        steadyStateActive: true,
        postTerminusSteadyStateMilestone: "steady_state_healthy",
        overdueCount: 0,
        measurableTracksNeedAttention: false,
        postTerminusSteadyStateIntegrityPassed: true,
        perCustomerIsolation: true,
        eraCharterReviewed: true,
        era25OperatorLoopLockIntegrityPassed: true,
      }),
    ).toBe("steady_state_operator_loop_passed");
  });

  it("resolves awaiting_steady_state_track_attention when tracks overdue", () => {
    expect(
      resolveSteadyStateOperatorLoopLockExecutionMilestone({
        productionPilotReadyPassed: true,
        steadyStateActive: true,
        postTerminusSteadyStateMilestone: "steady_state_healthy",
        overdueCount: 2,
        measurableTracksNeedAttention: true,
        postTerminusSteadyStateIntegrityPassed: true,
        perCustomerIsolation: true,
        eraCharterReviewed: true,
        era25OperatorLoopLockIntegrityPassed: true,
      }),
    ).toBe("awaiting_steady_state_track_attention");
  });

  it("builds twelve lock execution gates", () => {
    const gates = buildSteadyStateOperatorLoopLockExecutionGates({
      productionPilotReadyPassed: false,
      productionPilotReadyClosureMilestone: "awaiting_p0_execution",
      steadyStateActive: false,
      postTerminusSteadyStateMilestone: "engineering_terminus_blocked",
      tracksHealthy: false,
      overdueCount: 3,
      postTerminusSteadyStateIntegrityPassed: false,
      engineeringPathTerminusIntegrityPassed: false,
      era25OperatorLoopLockIntegrityPassed: false,
      eraCharterReviewed: false,
      perCustomerIsolation: false,
      goDecision: "NO-GO",
      commercialInflectionMilestone: "p0_ops_vault_blocked",
      steadyStateReportPresent: false,
    });
    expect(gates.length).toBe(12);
    expect(gates.find((gate) => gate.id === "production_pilot_ready_closure")?.complete).toBe(
      false,
    );
  });

  it("builds honest blocked summary from live repo state", () => {
    const summary = buildSteadyStateOperatorLoopLockExecutionSummary({});
    expect(summary.version).toBe("steady-state-operator-loop-lock-execution-v1");
    expect(summary.policyId).toBe("era43-steady-state-operator-loop-lock-execution-v1");
    expect(summary.milestone).not.toBe("steady_state_operator_loop_passed");
    expect(summary.gates.length).toBe(12);
  });
});

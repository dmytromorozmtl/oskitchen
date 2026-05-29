import { describe, expect, it } from "vitest";

import {
  MAINTENANCE_MODE_MONTHLY_CADENCE_RHYTHM_IDS,
  MAINTENANCE_MODE_WEEKLY_RHYTHM_IDS,
} from "@/lib/commercial/maintenance-mode-post-product-evolution-orchestrator-era24";
import {
  buildMaintenanceModeExecutionGates,
  buildMaintenanceModeExecutionSummary,
  resolveMaintenanceModeExecutionMilestone,
} from "@/lib/ops/maintenance-mode-execution-orchestrator";

describe("maintenance-mode-execution-orchestrator", () => {
  it("resolves continuous_improvement_loop_blocked before maintenance mode", () => {
    expect(
      resolveMaintenanceModeExecutionMilestone({
        continuousImprovementLoopPassed: false,
        maintenanceModeActive: true,
        overdueCount: 0,
        nextAttentionRhythm: null,
        weeklyRhythmNeedsAttention: false,
        monthlyCadenceNeedsAttention: false,
        maintenanceModeStarted: false,
        rhythmCalendarReviewed: false,
        perCustomerIsolation: true,
        maintenanceModeIntegrityPassed: true,
        reentrantIntegrityPassed: true,
        charterLockIntegrityPassed: true,
      }),
    ).toBe("continuous_improvement_loop_blocked");
  });

  it("resolves awaiting_maintenance_mode_active when CI loop passed but path inactive", () => {
    expect(
      resolveMaintenanceModeExecutionMilestone({
        continuousImprovementLoopPassed: true,
        maintenanceModeActive: false,
        overdueCount: 0,
        nextAttentionRhythm: null,
        weeklyRhythmNeedsAttention: false,
        monthlyCadenceNeedsAttention: false,
        maintenanceModeStarted: false,
        rhythmCalendarReviewed: false,
        perCustomerIsolation: true,
        maintenanceModeIntegrityPassed: false,
        reentrantIntegrityPassed: false,
        charterLockIntegrityPassed: false,
      }),
    ).toBe("awaiting_maintenance_mode_active");
  });

  it("resolves awaiting_rhythm_weekly when weekly rhythms need attention", () => {
    expect(
      resolveMaintenanceModeExecutionMilestone({
        continuousImprovementLoopPassed: true,
        maintenanceModeActive: true,
        overdueCount: 1,
        nextAttentionRhythm: { id: "weekly_wed_integration_health" },
        weeklyRhythmNeedsAttention: true,
        monthlyCadenceNeedsAttention: false,
        maintenanceModeStarted: false,
        rhythmCalendarReviewed: false,
        perCustomerIsolation: true,
        maintenanceModeIntegrityPassed: false,
        reentrantIntegrityPassed: false,
        charterLockIntegrityPassed: false,
      }),
    ).toBe("awaiting_rhythm_weekly");
    expect(MAINTENANCE_MODE_WEEKLY_RHYTHM_IDS).toContain("weekly_wed_integration_health");
  });

  it("resolves awaiting_per_pilot_isolation without scale gate", () => {
    expect(
      resolveMaintenanceModeExecutionMilestone({
        continuousImprovementLoopPassed: true,
        maintenanceModeActive: true,
        overdueCount: 0,
        nextAttentionRhythm: null,
        weeklyRhythmNeedsAttention: false,
        monthlyCadenceNeedsAttention: false,
        maintenanceModeStarted: false,
        rhythmCalendarReviewed: false,
        perCustomerIsolation: false,
        maintenanceModeIntegrityPassed: true,
        reentrantIntegrityPassed: true,
        charterLockIntegrityPassed: true,
      }),
    ).toBe("awaiting_per_pilot_isolation");
    expect(MAINTENANCE_MODE_MONTHLY_CADENCE_RHYTHM_IDS.length).toBe(4);
  });

  it("builds gates with CI loop blocked", () => {
    const gates = buildMaintenanceModeExecutionGates({
      continuousImprovementLoopPassed: false,
      ciLoopExecutionMilestone: "sustained_product_evolution_blocked",
      maintenanceModeActive: false,
      commercialPilotPathComplete: false,
      rhythmsHealthy: false,
      overdueCount: 3,
      weeklyRhythmHealthy: false,
      monthlyCadenceHealthy: false,
      perCustomerIsolation: false,
      maintenanceModeStarted: false,
      rhythmCalendarReviewed: false,
      maintenanceModeIntegrityPassed: false,
      productEvolutionIntegrityPassed: false,
      reentrantIntegrityPassed: false,
      charterLockIntegrityPassed: false,
      commercialInflectionMilestone: "p0_ops_vault_blocked",
      goDecision: "NO-GO",
      metricsBaselinePassed: false,
      integrationHonest: false,
    });
    expect(gates.find((gate) => gate.id === "continuous_improvement_loop")?.complete).toBe(false);
    expect(gates.length).toBe(12);
  });

  it("builds honest blocked summary from live repo state", () => {
    const summary = buildMaintenanceModeExecutionSummary({});
    expect(summary.version).toBe("maintenance-mode-execution-v1");
    expect(summary.policyId).toBe("era41-maintenance-mode-execution-v1");
    expect(summary.milestone).not.toBe("maintenance_mode_passed");
    expect(summary.gates.length).toBeGreaterThan(0);
    expect(summary.rhythms.length).toBe(10);
  });
});

import { describe, expect, it } from "vitest";

import {
  buildContinuousImprovementLoopTrackStatuses,
  resolveContinuousImprovementLoopHealthSummary,
} from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import {
  buildContinuousImprovementLoopExecutionGates,
  buildContinuousImprovementLoopExecutionSummary,
  resolveContinuousImprovementLoopExecutionMilestone,
} from "@/lib/ops/continuous-improvement-loop-execution-orchestrator";

function buildHealthyTracks() {
  const now = new Date().toISOString();
  return buildContinuousImprovementLoopTrackStatuses({
    p0Staging: {
      version: "era17-p0-staging-proof-unblock-v1",
      policyId: "era17-p0-staging-proof-unblock-v1",
      runAt: now,
      p0ProofStatus: "proof_passed",
      overall: "PASSED",
      children: {
        channelLive: { overall: "PASSED", steps: [] },
        stagingWorkflows: { overall: "PASSED", steps: [] },
        enterpriseSso: { overall: "SKIPPED", steps: [] },
      },
      steps: [],
    },
    tier2Summary: {
      version: "era21-tier2-staging-golden-path-v1",
      policyId: "era21-tier2-staging-golden-path-v1",
      runAt: now,
      tier2ProofStatus: "proof_passed",
      overall: "PASSED",
      steps: [],
    },
    metricsBaseline: {
      version: "era17-pilot-metrics-baseline-v1",
      policyId: "era17-pilot-metrics-baseline-v1",
      runAt: now,
      overall: "PASSED",
      metrics: [],
    },
    competitorMatrix: {
      version: "era17-competitor-feature-gap-matrix-v1",
      policyId: "era17-competitor-feature-gap-matrix-v1",
      runAt: now,
      overall: "PASSED",
      matrixProofStatus: "evidence_aligned_era17",
      steps: [],
    },
    customerName: "Test Operator",
  });
}

describe("continuous-improvement-loop-execution-orchestrator", () => {
  it("resolves sustained_product_evolution_blocked before CI loop", () => {
    expect(
      resolveContinuousImprovementLoopExecutionMilestone({
        sustainedProductEvolutionPassed: false,
        pureOperationalMode: true,
        overdueCount: 0,
        nextAttentionTrack: null,
        perCustomerIsolation: true,
        improvementLoopStarted: false,
        releaseCadenceReviewed: false,
        pureOperationalModeEra25Active: true,
        maintenanceModeActive: true,
        improvementLoopIntegrityPassed: true,
      }),
    ).toBe("sustained_product_evolution_blocked");
  });

  it("resolves awaiting_track_weekly_integration when integration stale", () => {
    const tracks = buildContinuousImprovementLoopTrackStatuses({
      p0Staging: null,
      tier2Summary: null,
      metricsBaseline: {
        version: "era17-pilot-metrics-baseline-v1",
        policyId: "era17-pilot-metrics-baseline-v1",
        runAt: new Date().toISOString(),
        overall: "PASSED",
        metrics: [],
      },
      competitorMatrix: {
        version: "era17-competitor-feature-gap-matrix-v1",
        policyId: "era17-competitor-feature-gap-matrix-v1",
        runAt: new Date().toISOString(),
        overall: "PASSED",
        matrixProofStatus: "evidence_aligned_era17",
        steps: [],
      },
      customerName: "Test Operator",
    });
    const health = resolveContinuousImprovementLoopHealthSummary(tracks);
    const weekly = tracks.find((track) => track.id === "weekly_integration")!;

    expect(
      resolveContinuousImprovementLoopExecutionMilestone({
        sustainedProductEvolutionPassed: true,
        pureOperationalMode: true,
        overdueCount: health.overdueCount,
        nextAttentionTrack: weekly,
        perCustomerIsolation: true,
        improvementLoopStarted: false,
        releaseCadenceReviewed: false,
        pureOperationalModeEra25Active: false,
        maintenanceModeActive: false,
        improvementLoopIntegrityPassed: false,
      }),
    ).toBe("awaiting_track_weekly_integration");
  });

  it("resolves awaiting_per_pilot_isolation without scale gate", () => {
    const tracks = buildHealthyTracks();
    expect(
      resolveContinuousImprovementLoopExecutionMilestone({
        sustainedProductEvolutionPassed: true,
        pureOperationalMode: true,
        overdueCount: 0,
        nextAttentionTrack: null,
        perCustomerIsolation: false,
        improvementLoopStarted: false,
        releaseCadenceReviewed: false,
        pureOperationalModeEra25Active: true,
        maintenanceModeActive: true,
        improvementLoopIntegrityPassed: true,
      }),
    ).toBe("awaiting_per_pilot_isolation");
    expect(tracks.length).toBe(7);
  });

  it("builds gates with product evolution blocked", () => {
    const gates = buildContinuousImprovementLoopExecutionGates({
      sustainedProductEvolutionPassed: false,
      productEvolutionExecutionMilestone: "sustained_operational_excellence_blocked",
      pureOperationalMode: false,
      sustainedOpsComplete: false,
      tracksHealthy: false,
      overdueCount: 3,
      weeklyIntegrationHealthy: false,
      monthlyMetricsHealthy: false,
      quarterlyGovernanceHealthy: false,
      perCustomerIsolation: false,
      improvementLoopStarted: false,
      releaseCadenceReviewed: false,
      pureOperationalModeEra25Active: false,
      maintenanceModeActive: false,
      improvementLoopIntegrityPassed: false,
      commercialInflectionMilestone: "p0_ops_vault_blocked",
      goDecision: "NO-GO",
      integrationHonest: false,
      metricsBaselinePassed: false,
      competitorAligned: false,
    });
    expect(gates.find((gate) => gate.id === "sustained_product_evolution")?.complete).toBe(false);
    expect(gates.length).toBe(12);
  });

  it("builds honest blocked summary from live repo state", () => {
    const summary = buildContinuousImprovementLoopExecutionSummary({});
    expect(summary.version).toBe("continuous-improvement-loop-execution-v1");
    expect(summary.policyId).toBe("era40-continuous-improvement-loop-execution-v1");
    expect(summary.milestone).not.toBe("continuous_improvement_loop_passed");
    expect(summary.gates.length).toBeGreaterThan(0);
    expect(summary.tracks.length).toBe(7);
  });
});

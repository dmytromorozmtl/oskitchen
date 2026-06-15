import { describe, expect, it } from "vitest";

import {
  buildSustainedProductEvolutionTrackStatuses,
  resolveSustainedProductEvolutionHealthSummary,
} from "@/lib/commercial/sustained-product-evolution-phases-era23";
import {
  buildSustainedProductEvolutionExecutionGates,
  buildSustainedProductEvolutionExecutionSummary,
  resolveSustainedProductEvolutionExecutionMilestone,
} from "@/lib/ops/sustained-product-evolution-execution-orchestrator";

function buildHealthyTracks() {
  return buildSustainedProductEvolutionTrackStatuses({
    metricsBaseline: {
      version: "era17-pilot-metrics-baseline-v1",
      policyId: "era17-pilot-metrics-baseline-v1",
      runAt: new Date().toISOString(),
      overall: "PASSED",
      metrics: [
        {
          id: "operator_feedback_score",
          label: "Operator feedback",
          status: "captured",
          value: 4.5,
        },
      ],
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
}

describe("sustained-product-evolution-execution-orchestrator", () => {
  it("resolves sustained_operational_excellence_blocked before product evolution", () => {
    const tracks = buildHealthyTracks();
    expect(
      resolveSustainedProductEvolutionExecutionMilestone({
        sustainedOperationalExcellencePassed: false,
        continuousImprovementLoopActive: true,
        productEvolutionReady: true,
        sustainedOpsConvergenceReady: true,
        pureOperationalModeEra25Active: true,
        overdueCount: 0,
        nextAttentionTrack: null,
        productEvolutionStarted: false,
        ownershipMatrixReviewed: false,
        productEvolutionIntegrityPassed: true,
      }),
    ).toBe("sustained_operational_excellence_blocked");
    expect(tracks.length).toBeGreaterThan(0);
  });

  it("resolves awaiting_improvement_loop_closure when CI loop inactive", () => {
    expect(
      resolveSustainedProductEvolutionExecutionMilestone({
        sustainedOperationalExcellencePassed: true,
        continuousImprovementLoopActive: false,
        productEvolutionReady: false,
        sustainedOpsConvergenceReady: false,
        pureOperationalModeEra25Active: false,
        overdueCount: 0,
        nextAttentionTrack: null,
        productEvolutionStarted: false,
        ownershipMatrixReviewed: false,
        productEvolutionIntegrityPassed: false,
      }),
    ).toBe("awaiting_improvement_loop_closure");
  });

  it("resolves awaiting_track_customer_feedback when feedback overdue", () => {
    const tracks = buildSustainedProductEvolutionTrackStatuses({
      metricsBaseline: null,
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
    const health = resolveSustainedProductEvolutionHealthSummary(tracks);
    const feedback = tracks.find((track) => track.id === "customer_feedback_backlog")!;

    expect(
      resolveSustainedProductEvolutionExecutionMilestone({
        sustainedOperationalExcellencePassed: true,
        continuousImprovementLoopActive: true,
        productEvolutionReady: true,
        sustainedOpsConvergenceReady: true,
        pureOperationalModeEra25Active: false,
        overdueCount: health.overdueCount,
        nextAttentionTrack: feedback,
        productEvolutionStarted: false,
        ownershipMatrixReviewed: false,
        productEvolutionIntegrityPassed: false,
      }),
    ).toBe("awaiting_track_customer_feedback");
  });

  it("builds gates with sustained ops blocked", () => {
    const gates = buildSustainedProductEvolutionExecutionGates({
      sustainedOperationalExcellencePassed: false,
      sustainedOpsExecutionMilestone: "awaiting_cadence_a_daily_operational",
      continuousImprovementLoopActive: false,
      productEvolutionReady: false,
      sustainedOpsConvergenceReady: false,
      pureOperationalModeEra25Active: false,
      tracksHealthy: false,
      overdueCount: 2,
      competitorLeapfrogHealthy: false,
      customerFeedbackHealthy: false,
      ownershipMatrixReviewed: false,
      productEvolutionStarted: false,
      productEvolutionIntegrityPassed: false,
      commercialInflectionMilestone: "p0_ops_vault_blocked",
      goDecision: "NO-GO",
      competitorAligned: false,
      metricsBaselinePassed: false,
    });
    expect(gates.find((gate) => gate.id === "sustained_operational_excellence")?.complete).toBe(
      false,
    );
    expect(gates.length).toBe(10);
  });

  it("builds honest blocked summary from live repo state", () => {
    const summary = buildSustainedProductEvolutionExecutionSummary({});
    expect(summary.version).toBe("sustained-product-evolution-execution-v1");
    expect(summary.policyId).toBe("era39-sustained-product-evolution-execution-v1");
    expect(summary.milestone).not.toBe("sustained_product_evolution_passed");
    expect(summary.gates.length).toBeGreaterThan(0);
    expect(summary.tracks.length).toBe(6);
  });
});

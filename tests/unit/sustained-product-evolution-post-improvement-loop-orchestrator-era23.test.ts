import { describe, expect, it } from "vitest";

import {
  buildSustainedProductEvolutionOrchestratorReportMarkdown,
  buildSustainedProductEvolutionPostImprovementLoopOrchestratorSummary,
  resolveSustainedProductEvolutionMilestone,
  resolveSustainedProductEvolutionMilestoneFromTrackStatuses,
} from "@/lib/commercial/sustained-product-evolution-post-improvement-loop-orchestrator-era23";
import { buildSustainedProductEvolutionTrackStatuses } from "@/lib/commercial/sustained-product-evolution-phases-era23";
import { evaluateSustainedProductEvolution } from "@/scripts/ops/validate-sustained-product-evolution";

describe("sustained-product-evolution-post-improvement-loop-orchestrator-era23", () => {
  it("blocks when improvement loop is not active", () => {
    const evaluation = evaluateSustainedProductEvolution({});
    expect(evaluation.productEvolutionMilestone).toBe("improvement_loop_blocked");
    expect(evaluation.productEvolutionReady).toBe(false);
  });

  it("resolves product_evolution_healthy when measurable tracks are fresh", () => {
    const tracks = buildSustainedProductEvolutionTrackStatuses({
      metricsBaseline: {
        overall: "PASSED",
        runAt: new Date().toISOString(),
        capturedAt: new Date().toISOString(),
        metrics: [
          {
            id: "operator_feedback_score",
            label: "Operator feedback score",
            status: "captured",
            value: 4.2,
            unit: "score_1_5",
          },
        ],
      } as never,
      competitorMatrix: {
        overall: "PASSED",
        matrixProofStatus: "evidence_aligned_era17",
        runAt: new Date().toISOString(),
      } as never,
      customerName: "Acme",
    });
    const milestone = resolveSustainedProductEvolutionMilestone({
      productEvolutionReady: true,
      tracks,
    });
    expect(milestone).toBe("product_evolution_healthy");
  });

  it("builds orchestrator summary with Step 10 redirect when blocked", () => {
    const evaluation = evaluateSustainedProductEvolution({});
    const summary = buildSustainedProductEvolutionPostImprovementLoopOrchestratorSummary({
      evaluation,
      artifacts: {
        goNoGoPresent: true,
        metricsBaselinePresent: false,
        competitorMatrixPresent: false,
      },
    });
    expect(summary.milestone).toBe("improvement_loop_blocked");
    expect(summary.recommendedCommands[0]).toContain(
      "continuous-improvement-loop-post-sustained-ops-orchestrator",
    );
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluateSustainedProductEvolution({});
    const summary = buildSustainedProductEvolutionPostImprovementLoopOrchestratorSummary({
      evaluation,
      artifacts: {
        goNoGoPresent: true,
        metricsBaselinePresent: false,
        competitorMatrixPresent: false,
      },
    });
    const markdown = buildSustainedProductEvolutionOrchestratorReportMarkdown({
      summary,
      evaluation,
    });
    expect(markdown).toContain("Sustained Product Evolution — Orchestrator Report");
    expect(markdown).toContain("sustained-product-evolution");
  });

  it("resolves milestone from track statuses for UI", () => {
    const milestone = resolveSustainedProductEvolutionMilestoneFromTrackStatuses(
      [{ id: "customer_feedback_backlog", status: "overdue" }],
      { productEvolutionReady: true },
    );
    expect(milestone).toBe("attention_customer_feedback");
  });
});

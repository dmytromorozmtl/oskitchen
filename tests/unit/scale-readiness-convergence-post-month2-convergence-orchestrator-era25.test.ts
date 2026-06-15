import { describe, expect, it } from "vitest";

import {
  buildScaleReadinessConvergenceEra25OrchestratorReportMarkdown,
  buildScaleReadinessConvergenceEra25OrchestratorSummary,
  resolveScaleReadinessConvergenceEra25Milestone,
} from "@/lib/commercial/scale-readiness-convergence-post-month2-convergence-orchestrator-era25";
import { evaluateScaleReadinessConvergenceEra25 } from "@/lib/commercial/evaluate-scale-readiness-convergence-era25";

describe("scale-readiness-convergence-post-month2-convergence-orchestrator-era25", () => {
  it("blocks when month 2 convergence is not ready", () => {
    const milestone = resolveScaleReadinessConvergenceEra25Milestone({
      month2MarketReadinessConvergenceEra25Milestone: "week1_convergence_regression_blocked",
      scaleComplete: false,
      phases: [],
    });
    expect(milestone).toBe("month2_convergence_regression_blocked");
  });

  it("resolves scale_readiness_convergence_era25_ready when complete", () => {
    const milestone = resolveScaleReadinessConvergenceEra25Milestone({
      month2MarketReadinessConvergenceEra25Milestone:
        "month2_market_readiness_convergence_era25_ready",
      scaleComplete: true,
      phases: [],
    });
    expect(milestone).toBe("scale_readiness_convergence_era25_ready");
  });

  it("builds orchestrator summary with month 2 redirect when blocked", () => {
    const evaluation = evaluateScaleReadinessConvergenceEra25({});
    const summary = buildScaleReadinessConvergenceEra25OrchestratorSummary({
      evaluation,
      artifacts: { convergenceReportPresent: false },
    });
    expect(summary.milestone).toBe("month2_convergence_regression_blocked");
    expect(summary.recommendedCommands[0]).toContain("month2-market-readiness-convergence");
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluateScaleReadinessConvergenceEra25({});
    const summary = buildScaleReadinessConvergenceEra25OrchestratorSummary({
      evaluation,
      artifacts: { convergenceReportPresent: false },
    });
    const markdown = buildScaleReadinessConvergenceEra25OrchestratorReportMarkdown({
      summary,
      evaluation,
    });
    expect(markdown).toContain("era25 Scale Readiness Convergence — Orchestrator Report");
    expect(markdown).toContain("#era25-scale-readiness-convergence");
  });
});

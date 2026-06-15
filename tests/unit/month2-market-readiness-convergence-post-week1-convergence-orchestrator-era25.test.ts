import { describe, expect, it } from "vitest";

import {
  buildMonth2MarketReadinessConvergenceEra25OrchestratorReportMarkdown,
  buildMonth2MarketReadinessConvergenceEra25OrchestratorSummary,
  resolveMonth2MarketReadinessConvergenceEra25Milestone,
} from "@/lib/commercial/month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25";
import { evaluateMonth2MarketReadinessConvergenceEra25 } from "@/lib/commercial/evaluate-month2-market-readiness-convergence-era25";

describe("month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25", () => {
  it("blocks when week 1 convergence is not ready", () => {
    const milestone = resolveMonth2MarketReadinessConvergenceEra25Milestone({
      pilotWeek1ExecutionConvergenceEra25Milestone: "go_convergence_regression_blocked",
      month2Complete: false,
      metricsBaselinePassed: false,
      phases: [],
    });
    expect(milestone).toBe("week1_convergence_regression_blocked");
  });

  it("resolves month2_market_readiness_convergence_era25_ready when complete", () => {
    const milestone = resolveMonth2MarketReadinessConvergenceEra25Milestone({
      pilotWeek1ExecutionConvergenceEra25Milestone: "pilot_week1_execution_convergence_era25_ready",
      month2Complete: true,
      metricsBaselinePassed: true,
      phases: [],
    });
    expect(milestone).toBe("month2_market_readiness_convergence_era25_ready");
  });

  it("builds orchestrator summary with week 1 redirect when blocked", () => {
    const evaluation = evaluateMonth2MarketReadinessConvergenceEra25({});
    const summary = buildMonth2MarketReadinessConvergenceEra25OrchestratorSummary({
      evaluation,
      artifacts: { convergenceReportPresent: false },
    });
    expect(summary.milestone).toBe("week1_convergence_regression_blocked");
    expect(summary.recommendedCommands[0]).toContain("pilot-week1-execution-convergence");
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluateMonth2MarketReadinessConvergenceEra25({});
    const summary = buildMonth2MarketReadinessConvergenceEra25OrchestratorSummary({
      evaluation,
      artifacts: { convergenceReportPresent: false },
    });
    const markdown = buildMonth2MarketReadinessConvergenceEra25OrchestratorReportMarkdown({
      summary,
      evaluation,
    });
    expect(markdown).toContain("era25 Month 2 Market Readiness Convergence — Orchestrator Report");
    expect(markdown).toContain("#era25-month2-market-readiness-convergence");
  });
});

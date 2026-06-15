import { describe, expect, it } from "vitest";

import {
  buildMarketLeaderPositioningConvergenceEra25OrchestratorReportMarkdown,
  buildMarketLeaderPositioningConvergenceEra25OrchestratorSummary,
  resolveMarketLeaderPositioningConvergenceEra25Milestone,
} from "@/lib/commercial/market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25";
import { evaluateMarketLeaderPositioningConvergenceEra25 } from "@/lib/commercial/evaluate-market-leader-positioning-convergence-era25";

describe("market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25", () => {
  it("blocks when series a convergence is not ready", () => {
    const milestone = resolveMarketLeaderPositioningConvergenceEra25Milestone({
      seriesAPartnerExpansionConvergenceEra25Milestone: "scale_convergence_regression_blocked",
      marketLeaderComplete: false,
      phases: [],
    });
    expect(milestone).toBe("series_a_convergence_regression_blocked");
  });

  it("resolves market_leader_positioning_convergence_era25_ready when complete", () => {
    const milestone = resolveMarketLeaderPositioningConvergenceEra25Milestone({
      seriesAPartnerExpansionConvergenceEra25Milestone:
        "series_a_partner_expansion_convergence_era25_ready",
      marketLeaderComplete: true,
      phases: [],
    });
    expect(milestone).toBe("market_leader_positioning_convergence_era25_ready");
  });

  it("builds orchestrator summary with series a redirect when blocked", () => {
    const evaluation = evaluateMarketLeaderPositioningConvergenceEra25({});
    const summary = buildMarketLeaderPositioningConvergenceEra25OrchestratorSummary({
      evaluation,
      artifacts: { convergenceReportPresent: false },
    });
    expect(summary.milestone).toBe("series_a_convergence_regression_blocked");
    expect(summary.recommendedCommands[0]).toContain("series-a-partner-expansion-convergence");
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluateMarketLeaderPositioningConvergenceEra25({});
    const summary = buildMarketLeaderPositioningConvergenceEra25OrchestratorSummary({
      evaluation,
      artifacts: { convergenceReportPresent: false },
    });
    const markdown = buildMarketLeaderPositioningConvergenceEra25OrchestratorReportMarkdown({
      summary,
      evaluation,
    });
    expect(markdown).toContain(
      "era25 Market Leader Positioning Convergence — Orchestrator Report",
    );
    expect(markdown).toContain("#era25-market-leader-positioning-convergence");
  });
});

import { describe, expect, it } from "vitest";

import {
  buildSeriesAPartnerExpansionConvergenceEra25OrchestratorReportMarkdown,
  buildSeriesAPartnerExpansionConvergenceEra25OrchestratorSummary,
  resolveSeriesAPartnerExpansionConvergenceEra25Milestone,
} from "@/lib/commercial/series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25";
import { evaluateSeriesAPartnerExpansionConvergenceEra25 } from "@/lib/commercial/evaluate-series-a-partner-expansion-convergence-era25";

describe("series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25", () => {
  it("blocks when scale convergence is not ready", () => {
    const milestone = resolveSeriesAPartnerExpansionConvergenceEra25Milestone({
      scaleReadinessConvergenceEra25Milestone: "month2_convergence_regression_blocked",
      seriesAComplete: false,
      phases: [],
    });
    expect(milestone).toBe("scale_convergence_regression_blocked");
  });

  it("resolves series_a_partner_expansion_convergence_era25_ready when complete", () => {
    const milestone = resolveSeriesAPartnerExpansionConvergenceEra25Milestone({
      scaleReadinessConvergenceEra25Milestone: "scale_readiness_convergence_era25_ready",
      seriesAComplete: true,
      phases: [],
    });
    expect(milestone).toBe("series_a_partner_expansion_convergence_era25_ready");
  });

  it("builds orchestrator summary with scale redirect when blocked", () => {
    const evaluation = evaluateSeriesAPartnerExpansionConvergenceEra25({});
    const summary = buildSeriesAPartnerExpansionConvergenceEra25OrchestratorSummary({
      evaluation,
      artifacts: { convergenceReportPresent: false },
    });
    expect(summary.milestone).toBe("scale_convergence_regression_blocked");
    expect(summary.recommendedCommands[0]).toContain("scale-readiness-convergence");
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluateSeriesAPartnerExpansionConvergenceEra25({});
    const summary = buildSeriesAPartnerExpansionConvergenceEra25OrchestratorSummary({
      evaluation,
      artifacts: { convergenceReportPresent: false },
    });
    const markdown = buildSeriesAPartnerExpansionConvergenceEra25OrchestratorReportMarkdown({
      summary,
      evaluation,
    });
    expect(markdown).toContain(
      "era25 Series A / Partner Expansion Convergence — Orchestrator Report",
    );
    expect(markdown).toContain("#era25-series-a-partner-expansion-convergence");
  });
});

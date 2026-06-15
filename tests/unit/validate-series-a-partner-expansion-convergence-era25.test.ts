import { describe, expect, it } from "vitest";

import { buildSeriesAPartnerExpansionConvergenceEra25ReportMarkdown } from "../../scripts/ops/sync-series-a-partner-expansion-convergence-era25-report";
import { evaluateSeriesAPartnerExpansionConvergenceEra25WithMilestones } from "../../scripts/ops/validate-series-a-partner-expansion-convergence-era25";

describe("validate-series-a-partner-expansion-convergence-era25", () => {
  it("evaluates convergence with milestones and smoke flags", () => {
    const result = evaluateSeriesAPartnerExpansionConvergenceEra25WithMilestones({});
    expect(result.seriesAPartnerExpansionConvergenceEra25Milestone).toBe(
      "scale_convergence_regression_blocked",
    );
    expect(result.evaluation.convergenceBlocked).toBe(true);
    expect(result.readyForScaleConvergenceRegressionSmokes).toBe(true);
  });

  it("builds convergence report markdown", () => {
    const result = evaluateSeriesAPartnerExpansionConvergenceEra25WithMilestones({});
    const markdown = buildSeriesAPartnerExpansionConvergenceEra25ReportMarkdown(result);
    expect(markdown).toContain("era25 Series A / Partner Expansion Convergence Report");
    expect(markdown).toContain("scale_convergence_regression_blocked");
  });
});

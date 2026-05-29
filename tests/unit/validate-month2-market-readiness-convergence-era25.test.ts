import { describe, expect, it } from "vitest";

import { buildMonth2MarketReadinessConvergenceEra25ReportMarkdown } from "../../scripts/ops/sync-month2-market-readiness-convergence-era25-report";
import { evaluateMonth2MarketReadinessConvergenceEra25WithMilestones } from "../../scripts/ops/validate-month2-market-readiness-convergence-era25";

describe("validate-month2-market-readiness-convergence-era25", () => {
  it("evaluates convergence with milestones and smoke flags", () => {
    const result = evaluateMonth2MarketReadinessConvergenceEra25WithMilestones({});
    expect(result.month2MarketReadinessConvergenceEra25Milestone).toBe(
      "week1_convergence_regression_blocked",
    );
    expect(result.evaluation.convergenceBlocked).toBe(true);
    expect(result.readyForWeek1ConvergenceRegressionSmokes).toBe(true);
  });

  it("builds convergence report markdown", () => {
    const result = evaluateMonth2MarketReadinessConvergenceEra25WithMilestones({});
    const markdown = buildMonth2MarketReadinessConvergenceEra25ReportMarkdown(result);
    expect(markdown).toContain("era25 Month 2 Market Readiness Convergence Report");
    expect(markdown).toContain("week1_convergence_regression_blocked");
  });
});

import { describe, expect, it } from "vitest";

import { buildPaidPilotGoConvergenceEra25ReportMarkdown } from "../../scripts/ops/sync-paid-pilot-go-convergence-era25-report";
import { evaluatePaidPilotGoConvergenceEra25WithMilestones } from "../../scripts/ops/validate-paid-pilot-go-convergence-era25";

describe("validate-paid-pilot-go-convergence-era25", () => {
  it("evaluates convergence with milestones and smoke flags", () => {
    const result = evaluatePaidPilotGoConvergenceEra25WithMilestones({});
    expect(result.paidPilotGoConvergenceEra25Milestone).toBe("breakthrough_regression_blocked");
    expect(result.evaluation.convergenceBlocked).toBe(true);
    expect(result.readyForBreakthroughRegressionSmokes).toBe(true);
  });

  it("builds convergence report markdown", () => {
    const result = evaluatePaidPilotGoConvergenceEra25WithMilestones({});
    const markdown = buildPaidPilotGoConvergenceEra25ReportMarkdown(result);
    expect(markdown).toContain("era25 Paid Pilot GO Convergence Report");
    expect(markdown).toContain("breakthrough_regression_blocked");
  });
});

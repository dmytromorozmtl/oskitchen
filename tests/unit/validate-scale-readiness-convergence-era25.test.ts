import { describe, expect, it } from "vitest";

import { buildScaleReadinessConvergenceEra25ReportMarkdown } from "../../scripts/ops/sync-scale-readiness-convergence-era25-report";
import { evaluateScaleReadinessConvergenceEra25WithMilestones } from "../../scripts/ops/validate-scale-readiness-convergence-era25";

describe("validate-scale-readiness-convergence-era25", () => {
  it("evaluates convergence with milestones and smoke flags", () => {
    const result = evaluateScaleReadinessConvergenceEra25WithMilestones({});
    expect(result.scaleReadinessConvergenceEra25Milestone).toBe(
      "month2_convergence_regression_blocked",
    );
    expect(result.evaluation.convergenceBlocked).toBe(true);
    expect(result.readyForMonth2ConvergenceRegressionSmokes).toBe(true);
  });

  it("builds convergence report markdown", () => {
    const result = evaluateScaleReadinessConvergenceEra25WithMilestones({});
    const markdown = buildScaleReadinessConvergenceEra25ReportMarkdown(result);
    expect(markdown).toContain("era25 Scale Readiness Convergence Report");
    expect(markdown).toContain("month2_convergence_regression_blocked");
  });
});

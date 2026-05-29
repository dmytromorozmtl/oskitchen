import { describe, expect, it } from "vitest";

import { evaluateMarketLeaderPositioningConvergenceEra25WithMilestones } from "@/scripts/ops/validate-market-leader-positioning-convergence-era25";

describe("validate-market-leader-positioning-convergence-era25", () => {
  it("evaluates convergence with milestones", () => {
    const result = evaluateMarketLeaderPositioningConvergenceEra25WithMilestones({});
    expect(result.marketLeaderPositioningConvergenceEra25Milestone).toBe(
      "series_a_convergence_regression_blocked",
    );
    expect(result.evaluation.convergenceBlocked).toBe(true);
  });
});

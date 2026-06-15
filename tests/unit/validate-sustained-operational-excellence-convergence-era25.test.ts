import { describe, expect, it } from "vitest";

import { evaluateSustainedOperationalExcellenceConvergenceEra25WithMilestones } from "@/scripts/ops/validate-sustained-operational-excellence-convergence-era25";

describe("validate-sustained-operational-excellence-convergence-era25", () => {
  it("evaluates convergence with milestones", () => {
    const result = evaluateSustainedOperationalExcellenceConvergenceEra25WithMilestones({});
    expect(result.sustainedOperationalExcellenceConvergenceEra25Milestone).toBe(
      "market_leader_convergence_regression_blocked",
    );
    expect(result.evaluation.convergenceBlocked).toBe(true);
  });
});

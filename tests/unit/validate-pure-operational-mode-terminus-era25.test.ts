import { describe, expect, it } from "vitest";

import { evaluatePureOperationalModeTerminusEra25WithMilestones } from "@/scripts/ops/validate-pure-operational-mode-terminus-era25";

describe("validate-pure-operational-mode-terminus-era25", () => {
  it("evaluates terminus with milestones", () => {
    const result = evaluatePureOperationalModeTerminusEra25WithMilestones({});
    expect(result.pureOperationalModeTerminusEra25Milestone).toBe(
      "sustained_ops_convergence_regression_blocked",
    );
    expect(result.evaluation.terminusBlocked).toBe(true);
  });
});

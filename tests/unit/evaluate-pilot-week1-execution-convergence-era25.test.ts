import { describe, expect, it } from "vitest";

import { evaluatePilotWeek1ExecutionConvergenceEra25 } from "@/lib/commercial/evaluate-pilot-week1-execution-convergence-era25";

describe("evaluate-pilot-week1-execution-convergence-era25", () => {
  it("blocks convergence when go convergence not ready", () => {
    const evaluation = evaluatePilotWeek1ExecutionConvergenceEra25({});
    expect(evaluation.convergenceBlocked).toBe(true);
    expect(evaluation.goConvergence.paidPilotGoConvergenceEra25Milestone).toBe(
      "breakthrough_regression_blocked",
    );
    expect(evaluation.convergenceTargets).toHaveLength(4);
  });

  it("includes launch wizard slice with day progress", () => {
    const evaluation = evaluatePilotWeek1ExecutionConvergenceEra25({});
    expect(evaluation.launchWizardSlice.totalPhaseCount).toBe(5);
    expect(evaluation.week1State.week1Complete).toBe(false);
  });
});

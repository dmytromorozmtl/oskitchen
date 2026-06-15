import { describe, expect, it } from "vitest";

import { evaluateMonth2MarketReadinessConvergenceEra25 } from "@/lib/commercial/evaluate-month2-market-readiness-convergence-era25";

describe("evaluate-month2-market-readiness-convergence-era25", () => {
  it("blocks convergence when week 1 convergence not ready", () => {
    const evaluation = evaluateMonth2MarketReadinessConvergenceEra25({});
    expect(evaluation.convergenceBlocked).toBe(true);
    expect(evaluation.week1ConvergenceReady).toBe(false);
    expect(evaluation.week1Convergence.pilotWeek1ExecutionConvergenceEra25Milestone).toBe(
      "go_convergence_regression_blocked",
    );
    expect(evaluation.convergenceTargets).toHaveLength(4);
  });

  it("includes launch wizard slice with workstream progress", () => {
    const evaluation = evaluateMonth2MarketReadinessConvergenceEra25({});
    expect(evaluation.launchWizardSlice.totalBlockingCount).toBeGreaterThan(0);
    expect(evaluation.month2State.month2Complete).toBe(false);
  });
});

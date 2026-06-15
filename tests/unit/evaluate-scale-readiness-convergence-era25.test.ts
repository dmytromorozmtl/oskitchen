import { describe, expect, it } from "vitest";

import { evaluateScaleReadinessConvergenceEra25 } from "@/lib/commercial/evaluate-scale-readiness-convergence-era25";

describe("evaluate-scale-readiness-convergence-era25", () => {
  it("blocks convergence when month 2 convergence not ready", () => {
    const evaluation = evaluateScaleReadinessConvergenceEra25({});
    expect(evaluation.convergenceBlocked).toBe(true);
    expect(evaluation.month2ConvergenceReady).toBe(false);
    expect(evaluation.month2Convergence.month2MarketReadinessConvergenceEra25Milestone).toBe(
      "week1_convergence_regression_blocked",
    );
    expect(evaluation.convergenceTargets).toHaveLength(4);
  });

  it("includes launch wizard slice with gate progress", () => {
    const evaluation = evaluateScaleReadinessConvergenceEra25({});
    expect(evaluation.launchWizardSlice.totalBlockingCount).toBeGreaterThan(0);
    expect(evaluation.scaleState.scaleComplete).toBe(false);
  });
});

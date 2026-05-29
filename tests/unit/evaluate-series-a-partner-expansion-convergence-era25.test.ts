import { describe, expect, it } from "vitest";

import { evaluateSeriesAPartnerExpansionConvergenceEra25 } from "@/lib/commercial/evaluate-series-a-partner-expansion-convergence-era25";

describe("evaluate-series-a-partner-expansion-convergence-era25", () => {
  it("blocks convergence when scale convergence not ready", () => {
    const evaluation = evaluateSeriesAPartnerExpansionConvergenceEra25({});
    expect(evaluation.convergenceBlocked).toBe(true);
    expect(evaluation.scaleConvergenceReady).toBe(false);
    expect(evaluation.scaleConvergence.scaleReadinessConvergenceEra25Milestone).toBe(
      "month2_convergence_regression_blocked",
    );
    expect(evaluation.convergenceTargets).toHaveLength(4);
  });

  it("includes launch wizard slice with track progress", () => {
    const evaluation = evaluateSeriesAPartnerExpansionConvergenceEra25({});
    expect(evaluation.launchWizardSlice.totalBlockingCount).toBeGreaterThan(0);
    expect(evaluation.seriesAState.seriesAComplete).toBe(false);
  });
});

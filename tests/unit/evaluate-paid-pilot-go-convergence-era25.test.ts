import { describe, expect, it } from "vitest";

import { evaluatePaidPilotGoConvergenceEra25 } from "@/lib/commercial/evaluate-paid-pilot-go-convergence-era25";

describe("evaluate-paid-pilot-go-convergence-era25", () => {
  it("blocks convergence when breakthrough not ready", () => {
    const evaluation = evaluatePaidPilotGoConvergenceEra25({}, "/nonexistent-root-for-test");
    expect(evaluation.convergenceBlocked).toBe(true);
    expect(evaluation.breakthrough.ownerDailyBriefingBreakthroughEra25Milestone).toBe(
      "blueprint_regression_blocked",
    );
    expect(evaluation.convergenceTargets).toHaveLength(4);
  });

  it("includes launch wizard slice with honest missing artifact headline", () => {
    const evaluation = evaluatePaidPilotGoConvergenceEra25({}, "/nonexistent-root-for-test");
    expect(evaluation.launchWizardSlice.headline).toContain("artifact missing");
    expect(evaluation.launchWizardSlice.decision).toBe("NO-GO");
  });
});

import { describe, expect, it } from "vitest";

import { runSeriesAPartnerExpansionConvergencePostScaleConvergenceOrchestratorEra25 } from "../../scripts/ops/run-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25";

describe("run-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25", () => {
  it("returns orchestrator summary without writing artifacts", () => {
    const summary = runSeriesAPartnerExpansionConvergencePostScaleConvergenceOrchestratorEra25();
    expect(summary.policyId).toBe(
      "era25-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-v1",
    );
    expect(summary.milestone).toBe("scale_convergence_regression_blocked");
    expect(summary.convergenceBlocked).toBe(true);
  });
});

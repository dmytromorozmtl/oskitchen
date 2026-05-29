import { describe, expect, it } from "vitest";

import { runScaleReadinessConvergencePostMonth2ConvergenceOrchestratorEra25 } from "../../scripts/ops/run-scale-readiness-convergence-post-month2-convergence-orchestrator-era25";

describe("run-scale-readiness-convergence-post-month2-convergence-orchestrator-era25", () => {
  it("returns orchestrator summary without writing artifacts", () => {
    const summary = runScaleReadinessConvergencePostMonth2ConvergenceOrchestratorEra25();
    expect(summary.policyId).toBe(
      "era25-scale-readiness-convergence-post-month2-convergence-orchestrator-v1",
    );
    expect(summary.milestone).toBe("month2_convergence_regression_blocked");
    expect(summary.convergenceBlocked).toBe(true);
  });
});

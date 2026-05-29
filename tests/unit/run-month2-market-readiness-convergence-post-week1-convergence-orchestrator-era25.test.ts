import { describe, expect, it } from "vitest";

import { runMonth2MarketReadinessConvergencePostWeek1ConvergenceOrchestratorEra25 } from "../../scripts/ops/run-month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25";

describe("run-month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25", () => {
  it("returns orchestrator summary without writing artifacts", () => {
    const summary = runMonth2MarketReadinessConvergencePostWeek1ConvergenceOrchestratorEra25();
    expect(summary.policyId).toBe(
      "era25-month2-market-readiness-convergence-post-week1-convergence-orchestrator-v1",
    );
    expect(summary.milestone).toBe("week1_convergence_regression_blocked");
    expect(summary.convergenceBlocked).toBe(true);
  });
});

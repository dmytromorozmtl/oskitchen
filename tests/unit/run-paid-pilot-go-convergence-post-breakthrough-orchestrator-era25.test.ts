import { describe, expect, it } from "vitest";

import { runPaidPilotGoConvergencePostBreakthroughOrchestratorEra25 } from "../../scripts/ops/run-paid-pilot-go-convergence-post-breakthrough-orchestrator-era25";

describe("run-paid-pilot-go-convergence-post-breakthrough-orchestrator-era25", () => {
  it("returns orchestrator summary without writing artifacts", () => {
    const summary = runPaidPilotGoConvergencePostBreakthroughOrchestratorEra25();
    expect(summary.policyId).toBe(
      "era25-paid-pilot-go-convergence-post-breakthrough-orchestrator-v1",
    );
    expect(summary.milestone).toBe("breakthrough_regression_blocked");
    expect(summary.convergenceBlocked).toBe(true);
  });
});

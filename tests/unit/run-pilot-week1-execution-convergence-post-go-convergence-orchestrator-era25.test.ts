import { describe, expect, it } from "vitest";

import { runPilotWeek1ExecutionConvergencePostGoConvergenceOrchestratorEra25 } from "../../scripts/ops/run-pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25";

describe("run-pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25", () => {
  it("returns orchestrator summary without writing artifacts", () => {
    const summary = runPilotWeek1ExecutionConvergencePostGoConvergenceOrchestratorEra25();
    expect(summary.policyId).toBe(
      "era25-pilot-week1-execution-convergence-post-go-convergence-orchestrator-v1",
    );
    expect(summary.milestone).toBe("go_convergence_regression_blocked");
    expect(summary.convergenceBlocked).toBe(true);
  });
});

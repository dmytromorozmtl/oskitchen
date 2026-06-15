import { describe, expect, it } from "vitest";

import { runMarketLeaderPositioningConvergencePostSeriesAConvergenceOrchestratorEra25 } from "@/scripts/ops/run-market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25";

describe("run-market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25", () => {
  it("returns orchestrator summary without writing artifacts", () => {
    const summary =
      runMarketLeaderPositioningConvergencePostSeriesAConvergenceOrchestratorEra25();
    expect(summary.policyId).toBe(
      "era25-market-leader-positioning-convergence-post-series-a-convergence-orchestrator-v1",
    );
    expect(summary.recommendedCommands.length).toBeGreaterThan(0);
  });
});

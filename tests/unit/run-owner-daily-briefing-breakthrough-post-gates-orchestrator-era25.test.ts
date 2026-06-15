import { describe, expect, it } from "vitest";

import { runOwnerDailyBriefingBreakthroughPostGatesOrchestratorEra25 } from "../../scripts/ops/run-owner-daily-briefing-breakthrough-post-gates-orchestrator-era25";

describe("run-owner-daily-briefing-breakthrough-post-gates-orchestrator-era25", () => {
  it("returns orchestrator summary without writing artifacts", () => {
    const summary = runOwnerDailyBriefingBreakthroughPostGatesOrchestratorEra25();
    expect(summary.policyId).toBe(
      "era25-owner-daily-briefing-breakthrough-post-gates-orchestrator-v1",
    );
    expect(summary.milestone).toBe("blueprint_regression_blocked");
    expect(summary.sliceBlocked).toBe(true);
    expect(summary.briefingSchemeCount).toBe(5);
  });
});

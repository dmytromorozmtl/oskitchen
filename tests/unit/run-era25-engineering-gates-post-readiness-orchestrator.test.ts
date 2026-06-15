import { describe, expect, it } from "vitest";

import { runEra25EngineeringGatesPostReadinessOrchestrator } from "../../scripts/ops/run-era25-engineering-gates-post-readiness-orchestrator";

describe("run-era25-engineering-gates-post-readiness-orchestrator", () => {
  it("returns orchestrator summary without writing artifacts", () => {
    const summary = runEra25EngineeringGatesPostReadinessOrchestrator();
    expect(summary.policyId).toBe(
      "era24-era25-engineering-gates-post-readiness-orchestrator-v1",
    );
    expect(summary.milestone).toBe("charter_readiness_blocked");
    expect(summary.gatesBlocked).toBe(true);
    expect(summary.recommendedCommands.length).toBeGreaterThan(0);
  });
});

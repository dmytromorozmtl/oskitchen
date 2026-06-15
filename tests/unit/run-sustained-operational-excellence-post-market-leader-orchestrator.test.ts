import { describe, expect, it } from "vitest";

import { runSustainedOperationalExcellencePostMarketLeaderOrchestrator } from "../../scripts/ops/run-sustained-operational-excellence-post-market-leader-orchestrator";

describe("run-sustained-operational-excellence-post-market-leader-orchestrator", () => {
  it("runs orchestrator without throwing when skipping template", () => {
    const summary = runSustainedOperationalExcellencePostMarketLeaderOrchestrator({
      writeArtifacts: false,
      skipTemplate: true,
    });
    expect(summary.policyId).toBe(
      "era21-sustained-operational-excellence-post-market-leader-orchestrator-v1",
    );
    expect(summary.milestone).toBe("market_leader_blocked");
  });
});

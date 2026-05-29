import { describe, expect, it } from "vitest";

import { runMarketLeaderPositioningPostSeriesAOrchestrator } from "../../scripts/ops/run-market-leader-positioning-post-series-a-orchestrator";

describe("run-market-leader-positioning-post-series-a-orchestrator", () => {
  it("runs orchestrator without throwing when skipping template", () => {
    const summary = runMarketLeaderPositioningPostSeriesAOrchestrator({
      writeArtifacts: false,
      skipTemplate: true,
    });
    expect(summary.policyId).toBe("era21-market-leader-positioning-post-series-a-orchestrator-v1");
    expect(summary.milestone).toBe("series_a_blocked");
  });
});

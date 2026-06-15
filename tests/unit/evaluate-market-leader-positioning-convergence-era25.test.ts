import { describe, expect, it } from "vitest";

import { evaluateMarketLeaderPositioningConvergenceEra25 } from "@/lib/commercial/evaluate-market-leader-positioning-convergence-era25";

describe("evaluate-market-leader-positioning-convergence-era25", () => {
  it("blocks convergence until series a and market leader complete", () => {
    const result = evaluateMarketLeaderPositioningConvergenceEra25({});
    expect(result.convergenceBlocked).toBe(true);
    expect(result.seriesAConvergenceReady).toBe(false);
    expect(result.marketLeaderState.totalBlockingCount).toBeGreaterThan(0);
  });
});

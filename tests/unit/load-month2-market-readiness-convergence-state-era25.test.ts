import { describe, expect, it } from "vitest";

import { deriveMonth2MarketReadinessConvergenceState } from "@/lib/commercial/load-month2-market-readiness-convergence-state-era25";

describe("load-month2-market-readiness-convergence-state-era25", () => {
  it("derives month 2 state without faking completion", () => {
    const state = deriveMonth2MarketReadinessConvergenceState({});
    expect(state.month2Complete).toBe(false);
    expect(state.totalBlockingCount).toBeGreaterThan(0);
    expect(state.completedBlockingCount).toBeLessThan(state.totalBlockingCount);
  });
});

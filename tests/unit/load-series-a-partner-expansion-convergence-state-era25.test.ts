import { describe, expect, it } from "vitest";

import { deriveSeriesAPartnerExpansionConvergenceState } from "@/lib/commercial/load-series-a-partner-expansion-convergence-state-era25";

describe("load-series-a-partner-expansion-convergence-state-era25", () => {
  it("derives series a state without faking completion", () => {
    const state = deriveSeriesAPartnerExpansionConvergenceState({});
    expect(state.seriesAComplete).toBe(false);
    expect(state.totalBlockingCount).toBeGreaterThan(0);
    expect(state.completedBlockingCount).toBeLessThan(state.totalBlockingCount);
  });
});

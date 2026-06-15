import { describe, expect, it } from "vitest";

import { evaluateSustainedOperationalExcellenceConvergenceEra25 } from "@/lib/commercial/evaluate-sustained-operational-excellence-convergence-era25";

describe("evaluate-sustained-operational-excellence-convergence-era25", () => {
  it("blocks convergence until market leader and sustained ops complete", () => {
    const result = evaluateSustainedOperationalExcellenceConvergenceEra25({});
    expect(result.convergenceBlocked).toBe(true);
    expect(result.marketLeaderConvergenceReady).toBe(false);
    expect(result.sustainedOpsState.totalBlockingCount).toBeGreaterThan(0);
  });
});

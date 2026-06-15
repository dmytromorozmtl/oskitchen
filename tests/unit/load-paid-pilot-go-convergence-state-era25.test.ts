import { describe, expect, it } from "vitest";

import { derivePaidPilotGoConvergenceState } from "@/lib/commercial/load-paid-pilot-go-convergence-state-era25";

describe("load-paid-pilot-go-convergence-state-era25", () => {
  it("returns honest missing-artifact state without faking GO", () => {
    const state = derivePaidPilotGoConvergenceState("/nonexistent-root-for-test");
    expect(state.artifactPresent).toBe(false);
    expect(state.decision).toBeNull();
    expect(state.icpQualified).toBe(false);
    expect(state.topBlocker).toContain("missing");
  });
});

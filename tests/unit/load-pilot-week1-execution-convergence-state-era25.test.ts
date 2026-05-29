import { describe, expect, it } from "vitest";

import { derivePilotWeek1ExecutionConvergenceState } from "@/lib/commercial/load-pilot-week1-execution-convergence-state-era25";

describe("load-pilot-week1-execution-convergence-state-era25", () => {
  it("derives week 1 state without faking completion", () => {
    const state = derivePilotWeek1ExecutionConvergenceState({});
    expect(state.week1Complete).toBe(false);
    expect(state.totalPhaseCount).toBe(5);
    expect(state.completedPhaseCount).toBeLessThan(5);
  });
});

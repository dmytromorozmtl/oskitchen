import { describe, expect, it } from "vitest";

import { buildSustainedOperationalExcellenceConvergenceEra25UiSlice } from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";

describe("sustained-operational-excellence-convergence-ui-era25", () => {
  it("returns null when market leader convergence not visible", () => {
    expect(
      buildSustainedOperationalExcellenceConvergenceEra25UiSlice({
        marketLeaderConvergenceVisible: false,
      }),
    ).toBeNull();
  });

  it("builds visible slice when market leader convergence visible", () => {
    const slice = buildSustainedOperationalExcellenceConvergenceEra25UiSlice({
      marketLeaderConvergenceVisible: true,
    });
    expect(slice?.visible).toBe(true);
    expect(slice?.sustainedOperationalExcellenceConvergenceEra25Milestone).toBe(
      "market_leader_convergence_regression_blocked",
    );
    expect(slice?.platformOpsHref).toContain(
      "#era25-sustained-operational-excellence-convergence",
    );
    expect(slice?.pureOperationalModeTerminus?.visible).toBe(true);
    expect(slice?.pureOperationalModeTerminus?.platformOpsHref).toContain(
      "#era25-pure-operational-mode-terminus",
    );
  });
});

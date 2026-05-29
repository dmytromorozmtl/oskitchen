import { describe, expect, it } from "vitest";

import { buildMarketLeaderPositioningConvergenceEra25UiSlice } from "@/lib/commercial/market-leader-positioning-convergence-ui-era25";

describe("market-leader-positioning-convergence-ui-era25", () => {
  it("returns null when series a convergence not visible", () => {
    expect(
      buildMarketLeaderPositioningConvergenceEra25UiSlice({
        seriesAConvergenceVisible: false,
      }),
    ).toBeNull();
  });

  it("builds visible slice when series a convergence visible", () => {
    const slice = buildMarketLeaderPositioningConvergenceEra25UiSlice({
      seriesAConvergenceVisible: true,
    });
    expect(slice?.visible).toBe(true);
    expect(slice?.marketLeaderPositioningConvergenceEra25Milestone).toBe(
      "series_a_convergence_regression_blocked",
    );
    expect(slice?.platformOpsHref).toContain("#era25-market-leader-positioning-convergence");
  });
});

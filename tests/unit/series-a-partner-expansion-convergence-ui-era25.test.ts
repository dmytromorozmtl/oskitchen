import { describe, expect, it } from "vitest";

import {
  buildSeriesAPartnerExpansionConvergenceEra25UiSlice,
  formatSeriesAPartnerExpansionConvergenceEra25Label,
} from "@/lib/commercial/series-a-partner-expansion-convergence-ui-era25";

describe("series-a-partner-expansion-convergence-ui-era25", () => {
  it("returns null when scale convergence not visible", () => {
    expect(
      buildSeriesAPartnerExpansionConvergenceEra25UiSlice({ scaleConvergenceVisible: false }),
    ).toBeNull();
  });

  it("builds slice when scale convergence visible", () => {
    const slice = buildSeriesAPartnerExpansionConvergenceEra25UiSlice({
      scaleConvergenceVisible: true,
      env: {},
    });
    expect(slice).not.toBeNull();
    expect(slice?.outsideLinearCatalog).toBe(true);
    expect(slice?.seriesAPartnerExpansionConvergenceEra25Milestone).toBe(
      "scale_convergence_regression_blocked",
    );
    expect(slice?.postScaleConvergenceOrchestratorCommand).toContain(
      "run-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25",
    );
  });

  it("formats convergence label", () => {
    const slice = buildSeriesAPartnerExpansionConvergenceEra25UiSlice({
      scaleConvergenceVisible: true,
      env: {},
    });
    expect(slice).not.toBeNull();
    if (!slice) return;
    expect(formatSeriesAPartnerExpansionConvergenceEra25Label(slice)).toContain("series a");
    expect(formatSeriesAPartnerExpansionConvergenceEra25Label(slice)).toContain("BLOCKED");
  });
});

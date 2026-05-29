import { describe, expect, it } from "vitest";

import {
  buildPaidPilotGoConvergenceEra25UiSlice,
  formatPaidPilotGoConvergenceEra25Label,
} from "@/lib/commercial/paid-pilot-go-convergence-ui-era25";

describe("paid-pilot-go-convergence-ui-era25", () => {
  it("returns null when breakthrough not visible", () => {
    expect(buildPaidPilotGoConvergenceEra25UiSlice({ breakthroughVisible: false })).toBeNull();
  });

  it("builds slice when breakthrough visible", () => {
    const slice = buildPaidPilotGoConvergenceEra25UiSlice({
      breakthroughVisible: true,
      env: {},
    });
    expect(slice).not.toBeNull();
    expect(slice?.outsideLinearCatalog).toBe(true);
    expect(slice?.paidPilotGoConvergenceEra25Milestone).toBe("breakthrough_regression_blocked");
    expect(slice?.postBreakthroughOrchestratorCommand).toContain(
      "run-paid-pilot-go-convergence-post-breakthrough-orchestrator-era25",
    );
  });

  it("formats convergence label", () => {
    const slice = buildPaidPilotGoConvergenceEra25UiSlice({
      breakthroughVisible: true,
      env: {},
    });
    expect(slice).not.toBeNull();
    if (!slice) return;
    expect(formatPaidPilotGoConvergenceEra25Label(slice)).toContain("GO convergence");
    expect(formatPaidPilotGoConvergenceEra25Label(slice)).toContain("BLOCKED");
  });
});

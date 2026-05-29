import { describe, expect, it } from "vitest";

import {
  buildScaleReadinessConvergenceEra25UiSlice,
  formatScaleReadinessConvergenceEra25Label,
} from "@/lib/commercial/scale-readiness-convergence-ui-era25";

describe("scale-readiness-convergence-ui-era25", () => {
  it("returns null when month 2 convergence not visible", () => {
    expect(
      buildScaleReadinessConvergenceEra25UiSlice({ month2ConvergenceVisible: false }),
    ).toBeNull();
  });

  it("builds slice when month 2 convergence visible", () => {
    const slice = buildScaleReadinessConvergenceEra25UiSlice({
      month2ConvergenceVisible: true,
      env: {},
    });
    expect(slice).not.toBeNull();
    expect(slice?.outsideLinearCatalog).toBe(true);
    expect(slice?.scaleReadinessConvergenceEra25Milestone).toBe(
      "month2_convergence_regression_blocked",
    );
    expect(slice?.postMonth2ConvergenceOrchestratorCommand).toContain(
      "run-scale-readiness-convergence-post-month2-convergence-orchestrator-era25",
    );
  });

  it("formats convergence label", () => {
    const slice = buildScaleReadinessConvergenceEra25UiSlice({
      month2ConvergenceVisible: true,
      env: {},
    });
    expect(slice).not.toBeNull();
    if (!slice) return;
    expect(formatScaleReadinessConvergenceEra25Label(slice)).toContain("scale readiness");
    expect(formatScaleReadinessConvergenceEra25Label(slice)).toContain("BLOCKED");
  });
});

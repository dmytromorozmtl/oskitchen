import { describe, expect, it } from "vitest";

import {
  buildMonth2MarketReadinessConvergenceEra25UiSlice,
  formatMonth2MarketReadinessConvergenceEra25Label,
} from "@/lib/commercial/month2-market-readiness-convergence-ui-era25";

describe("month2-market-readiness-convergence-ui-era25", () => {
  it("returns null when week 1 convergence not visible", () => {
    expect(
      buildMonth2MarketReadinessConvergenceEra25UiSlice({ week1ConvergenceVisible: false }),
    ).toBeNull();
  });

  it("builds slice when week 1 convergence visible", () => {
    const slice = buildMonth2MarketReadinessConvergenceEra25UiSlice({
      week1ConvergenceVisible: true,
      env: {},
    });
    expect(slice).not.toBeNull();
    expect(slice?.outsideLinearCatalog).toBe(true);
    expect(slice?.month2MarketReadinessConvergenceEra25Milestone).toBe(
      "week1_convergence_regression_blocked",
    );
    expect(slice?.postWeek1ConvergenceOrchestratorCommand).toContain(
      "run-month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25",
    );
  });

  it("formats convergence label", () => {
    const slice = buildMonth2MarketReadinessConvergenceEra25UiSlice({
      week1ConvergenceVisible: true,
      env: {},
    });
    expect(slice).not.toBeNull();
    if (!slice) return;
    expect(formatMonth2MarketReadinessConvergenceEra25Label(slice)).toContain("month 2");
    expect(formatMonth2MarketReadinessConvergenceEra25Label(slice)).toContain("BLOCKED");
  });
});

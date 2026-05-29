import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingBreakthroughEra25UiSlice,
  formatOwnerDailyBriefingBreakthroughEra25Label,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-ui-era25";

describe("owner-daily-briefing-breakthrough-ui-era25", () => {
  it("returns null when blueprint not visible", () => {
    expect(
      buildOwnerDailyBriefingBreakthroughEra25UiSlice({ blueprintVisible: false }),
    ).toBeNull();
  });

  it("builds slice when blueprint visible", () => {
    const slice = buildOwnerDailyBriefingBreakthroughEra25UiSlice({
      blueprintVisible: true,
      env: {},
    });
    expect(slice).not.toBeNull();
    expect(slice?.outsideLinearCatalog).toBe(true);
    expect(slice?.briefingSchemeCount).toBe(5);
    expect(slice?.postGatesOrchestratorCommand).toContain(
      "run-owner-daily-briefing-breakthrough-post-gates-orchestrator-era25",
    );
    expect(slice?.ownerDailyBriefingBreakthroughEra25Milestone).toBe(
      "blueprint_regression_blocked",
    );
  });

  it("formats product slice label", () => {
    const slice = buildOwnerDailyBriefingBreakthroughEra25UiSlice({
      blueprintVisible: true,
      env: {},
    });
    expect(slice).not.toBeNull();
    if (!slice) return;
    expect(formatOwnerDailyBriefingBreakthroughEra25Label(slice)).toContain("breakthrough");
    expect(formatOwnerDailyBriefingBreakthroughEra25Label(slice)).toContain("B tiles");
  });
});

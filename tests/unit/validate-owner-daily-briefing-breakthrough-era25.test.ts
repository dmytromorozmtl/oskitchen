import { describe, expect, it } from "vitest";

import { buildOwnerDailyBriefingBreakthroughEra25ReportMarkdown } from "../../scripts/ops/sync-owner-daily-briefing-breakthrough-era25-report";
import { evaluateOwnerDailyBriefingBreakthroughEra25WithMilestones } from "../../scripts/ops/validate-owner-daily-briefing-breakthrough-era25";

describe("validate-owner-daily-briefing-breakthrough-era25", () => {
  it("evaluates product slice with milestones and smoke flags", () => {
    const result = evaluateOwnerDailyBriefingBreakthroughEra25WithMilestones({});
    expect(result.ownerDailyBriefingBreakthroughEra25Milestone).toBe(
      "blueprint_regression_blocked",
    );
    expect(result.evaluation.sliceBlocked).toBe(true);
    expect(result.readyForBlueprintRegressionSmokes).toBe(true);
  });

  it("builds product report markdown", () => {
    const result = evaluateOwnerDailyBriefingBreakthroughEra25WithMilestones({});
    const markdown = buildOwnerDailyBriefingBreakthroughEra25ReportMarkdown(result);
    expect(markdown).toContain("era25 Owner Daily Briefing Breakthrough Report");
    expect(markdown).toContain("B0");
  });
});

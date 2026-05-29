import { describe, expect, it } from "vitest";

import { buildEra25FirstProductSliceBlueprintReportMarkdown } from "../../scripts/ops/sync-era25-first-product-slice-blueprint-report";
import { evaluateEra25FirstProductSliceBlueprintWithMilestones } from "../../scripts/ops/validate-era25-first-product-slice-blueprint";

describe("validate-era25-first-product-slice-blueprint", () => {
  it("evaluates blueprint with milestones and smoke flags", () => {
    const result = evaluateEra25FirstProductSliceBlueprintWithMilestones({});
    expect(result.era25FirstProductSliceBlueprintMilestone).toBe("engineering_gates_blocked");
    expect(result.evaluation.blueprintBlocked).toBe(true);
    expect(result.readyForEngineeringGatesSmokes).toBe(true);
  });

  it("builds blueprint report markdown", () => {
    const result = evaluateEra25FirstProductSliceBlueprintWithMilestones({});
    const markdown = buildEra25FirstProductSliceBlueprintReportMarkdown(result);
    expect(markdown).toContain("era25 First Product Slice Blueprint Report");
    expect(markdown).toContain("owner-daily-briefing-breakthrough");
  });
});

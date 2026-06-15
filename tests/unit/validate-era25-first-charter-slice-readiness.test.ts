import { describe, expect, it } from "vitest";

import { buildEra25FirstCharterSliceReadinessReportMarkdown } from "../../scripts/ops/sync-era25-first-charter-slice-readiness-report";
import { evaluateEra25FirstCharterSliceReadinessWithMilestones } from "../../scripts/ops/validate-era25-first-charter-slice-readiness";

describe("validate-era25-first-charter-slice-readiness", () => {
  it("wraps milestones for validate JSON", () => {
    const result = evaluateEra25FirstCharterSliceReadinessWithMilestones({});
    expect(result.era25FirstCharterSliceReadinessMilestone).toBe("charter_exit_blocked");
    expect(result.readyForCharterExitSmokes).toBe(true);
    expect(result.evaluation.charterValidation.sectionsValid).toBe(false);
  });

  it("builds readiness report markdown", () => {
    const result = evaluateEra25FirstCharterSliceReadinessWithMilestones({});
    const markdown = buildEra25FirstCharterSliceReadinessReportMarkdown(result);
    expect(markdown).toContain("era25 First Charter Slice — Readiness Report");
    expect(markdown).toContain("Section checklist");
  });
});

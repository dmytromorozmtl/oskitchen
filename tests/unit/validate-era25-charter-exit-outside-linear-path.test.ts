import { describe, expect, it } from "vitest";

import { evaluateEra25CharterExitOutsideLinearPath } from "@/lib/commercial/evaluate-era25-charter-exit-outside-linear-path";
import { buildEra25CharterExitOutsideLinearPathReportMarkdown } from "../../scripts/ops/sync-era25-charter-exit-outside-linear-path-report";
import { evaluateEra25CharterExitOutsideLinearPathWithMilestones } from "../../scripts/ops/validate-era25-charter-exit-outside-linear-path";

describe("validate-era25-charter-exit-outside-linear-path", () => {
  it("wraps milestones for validate JSON", () => {
    const result = evaluateEra25CharterExitOutsideLinearPathWithMilestones({});
    expect(result.era25CharterExitMilestone).toBe("terminus_guard_blocked");
    expect(result.readyForTerminusGuardSmokes).toBe(true);
    expect(result.evaluation.terminusGuard.guard.guardPassed).toBe(true);
  });

  it("builds charter exit report", () => {
    const result = evaluateEra25CharterExitOutsideLinearPathWithMilestones({});
    const markdown = buildEra25CharterExitOutsideLinearPathReportMarkdown(result);
    expect(markdown).toContain("era25+ Charter Exit — Outside Linear Path Report");
    expect(markdown).toContain("NOT Step 18");
    expect(markdown).toContain("awaiting leadership sign-off");
  });

  it("evaluates base evaluation without throwing", () => {
    expect(() => evaluateEra25CharterExitOutsideLinearPath({})).not.toThrow();
  });
});

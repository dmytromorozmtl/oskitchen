import { describe, expect, it } from "vitest";

import { buildEra25EngineeringGatesRequireSignedCharterReportMarkdown } from "../../scripts/ops/sync-era25-engineering-gates-require-signed-charter-report";
import { evaluateEra25EngineeringGatesRequireSignedCharterWithMilestones } from "../../scripts/ops/validate-era25-engineering-gates-require-signed-charter";

describe("validate-era25-engineering-gates-require-signed-charter", () => {
  it("evaluates gates with milestones and smoke flags", () => {
    const result = evaluateEra25EngineeringGatesRequireSignedCharterWithMilestones({});
    expect(result.era25EngineeringGatesMilestone).toBe("charter_readiness_blocked");
    expect(result.evaluation.gatesBlocked).toBe(true);
    expect(result.readyForCharterReadinessSmokes).toBe(true);
  });

  it("builds gates report markdown", () => {
    const result = evaluateEra25EngineeringGatesRequireSignedCharterWithMilestones({});
    const markdown = buildEra25EngineeringGatesRequireSignedCharterReportMarkdown(result);
    expect(markdown).toContain("era25 Engineering Gates — Require Signed Charter Report");
    expect(markdown).toContain("Gates blocked");
  });
});

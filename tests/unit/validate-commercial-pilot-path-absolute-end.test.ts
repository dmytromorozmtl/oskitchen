import { describe, expect, it } from "vitest";

import { evaluateCommercialPilotPathAbsoluteEnd } from "@/lib/commercial/evaluate-commercial-pilot-path-absolute-end";
import { buildCommercialPilotPathAbsoluteEndReportMarkdown } from "../../scripts/ops/sync-commercial-pilot-path-absolute-end-report";
import { evaluateCommercialPilotPathAbsoluteEndWithMilestones } from "../../scripts/ops/validate-commercial-pilot-path-absolute-end";

describe("validate-commercial-pilot-path-absolute-end", () => {
  it("evaluates without throwing", () => {
    expect(() => evaluateCommercialPilotPathAbsoluteEnd({})).not.toThrow();
    expect(() => evaluateCommercialPilotPathAbsoluteEndWithMilestones({})).not.toThrow();
  });

  it("reports honest not-active locally", () => {
    const result = evaluateCommercialPilotPathAbsoluteEndWithMilestones({});
    expect(result.evaluation.absoluteEndActive).toBe(false);
    expect(result.evaluation.pathEngineeringClosed).toBe(true);
    expect(result.evaluation.totalSteps).toBe(16);
    expect(result.evaluation.path.steps).toHaveLength(16);
    expect(result.absoluteEndMilestone).toBe("steady_state_blocked");
    expect(result.readyForSteadyStateSmokes).toBe(true);
    expect(result.readyForPathClosureSmokes).toBe(true);
  });

  it("builds absolute end report markdown", () => {
    const result = evaluateCommercialPilotPathAbsoluteEndWithMilestones({});
    const markdown = buildCommercialPilotPathAbsoluteEndReportMarkdown(result);
    expect(markdown).toContain("Commercial Pilot Path — Absolute End Report");
    expect(markdown).toContain("Absolute end milestone");
    expect(markdown).toContain("Step 12");
    expect(markdown).toContain("/dashboard/launch-wizard");
  });
});

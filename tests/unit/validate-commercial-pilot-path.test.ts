import { describe, expect, it } from "vitest";

import { COMMERCIAL_PILOT_PATH_STEP_CATALOG } from "@/lib/commercial/engineering-path-terminus-era24";
import { evaluateCommercialPilotPathWithMilestones } from "../../scripts/ops/validate-commercial-pilot-path";
import { buildCommercialPilotPathStatusReportMarkdown } from "../../scripts/ops/sync-commercial-pilot-path-status-report";

describe("validate-commercial-pilot-path", () => {
  it("evaluates without throwing", () => {
    expect(() => evaluateCommercialPilotPathWithMilestones({})).not.toThrow();
  });

  it("returns 16 steps with honest local NO-GO", () => {
    const result = evaluateCommercialPilotPathWithMilestones({});
    expect(result.evaluation.steps).toHaveLength(16);
    expect(result.evaluation.summary.totalSteps).toBe(16);
    expect(result.evaluation.summary.pathComplete).toBe(false);
    expect(result.evaluation.summary.firstBlockedStep?.step).toBe(1);
    expect(result.evaluation.summary.gateStepsComplete).toBe(false);
    expect(result.engineeringPathTerminusMilestone).toBe("maintenance_mode_blocked");
    expect(result.readyForGateChainSmokes).toBe(true);
    expect(result.readyForMaintenanceRhythmSmokes).toBe(false);
  });

  it("aligns step ids with catalog", () => {
    const result = evaluateCommercialPilotPathWithMilestones({});
    expect(result.evaluation.steps.map((step) => step.id)).toEqual(
      COMMERCIAL_PILOT_PATH_STEP_CATALOG.map((step) => step.id),
    );
  });

  it("builds status report markdown", () => {
    const result = evaluateCommercialPilotPathWithMilestones({});
    const markdown = buildCommercialPilotPathStatusReportMarkdown(result);
    expect(markdown).toContain("Commercial Pilot Path — Status Report");
    expect(markdown).toContain("Step 1 — P0 ops vault");
    expect(markdown).toContain("Engineering path milestone");
    expect(markdown).toContain("ops:validate-commercial-pilot-path");
  });
});

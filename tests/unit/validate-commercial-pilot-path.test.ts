import { describe, expect, it } from "vitest";

import { COMMERCIAL_PILOT_PATH_STEP_CATALOG } from "@/lib/commercial/engineering-path-terminus-era24";
import { evaluateCommercialPilotPath } from "@/lib/commercial/evaluate-commercial-pilot-path";
import { buildCommercialPilotPathStatusReportMarkdown } from "../../scripts/ops/sync-commercial-pilot-path-status-report";

describe("validate-commercial-pilot-path", () => {
  it("evaluates without throwing", () => {
    expect(() => evaluateCommercialPilotPath({})).not.toThrow();
  });

  it("returns 16 steps with honest local NO-GO", () => {
    const result = evaluateCommercialPilotPath({});
    expect(result.steps).toHaveLength(16);
    expect(result.summary.totalSteps).toBe(16);
    expect(result.summary.pathComplete).toBe(false);
    expect(result.summary.firstBlockedStep?.step).toBe(1);
    expect(result.summary.gateStepsComplete).toBe(false);
  });

  it("aligns step ids with catalog", () => {
    const result = evaluateCommercialPilotPath({});
    expect(result.steps.map((step) => step.id)).toEqual(
      COMMERCIAL_PILOT_PATH_STEP_CATALOG.map((step) => step.id),
    );
  });

  it("builds status report markdown", () => {
    const result = evaluateCommercialPilotPath({});
    const markdown = buildCommercialPilotPathStatusReportMarkdown(result);
    expect(markdown).toContain("Commercial Pilot Path — Status Report");
    expect(markdown).toContain("Step 1 — P0 ops vault");
    expect(markdown).toContain("ops:validate-commercial-pilot-path");
  });
});

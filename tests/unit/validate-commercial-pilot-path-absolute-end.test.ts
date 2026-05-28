import { describe, expect, it } from "vitest";

import { evaluateCommercialPilotPathAbsoluteEnd } from "@/lib/commercial/evaluate-commercial-pilot-path-absolute-end";
import { buildCommercialPilotPathAbsoluteEndReportMarkdown } from "../../scripts/ops/sync-commercial-pilot-path-absolute-end-report";

describe("validate-commercial-pilot-path-absolute-end", () => {
  it("evaluates without throwing", () => {
    expect(() => evaluateCommercialPilotPathAbsoluteEnd({})).not.toThrow();
  });

  it("reports honest not-active locally", () => {
    const result = evaluateCommercialPilotPathAbsoluteEnd({});
    expect(result.absoluteEndActive).toBe(false);
    expect(result.pathEngineeringClosed).toBe(true);
    expect(result.totalSteps).toBe(16);
    expect(result.path.steps).toHaveLength(16);
  });

  it("builds absolute end report markdown", () => {
    const result = evaluateCommercialPilotPathAbsoluteEnd({});
    const markdown = buildCommercialPilotPathAbsoluteEndReportMarkdown(result);
    expect(markdown).toContain("Commercial Pilot Path — Absolute End Report");
    expect(markdown).toContain("Step 12");
    expect(markdown).toContain("/dashboard/launch-wizard");
  });
});

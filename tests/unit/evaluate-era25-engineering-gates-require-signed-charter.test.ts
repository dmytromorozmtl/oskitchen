import { describe, expect, it } from "vitest";

import { evaluateEra25EngineeringGatesRequireSignedCharter } from "@/lib/commercial/evaluate-era25-engineering-gates-require-signed-charter";

describe("evaluate-era25-engineering-gates-require-signed-charter", () => {
  it("blocks gates when charter readiness not ready", () => {
    const evaluation = evaluateEra25EngineeringGatesRequireSignedCharter({});
    expect(evaluation.gatesBlocked).toBe(true);
    expect(evaluation.readiness.era25FirstCharterSliceReadinessMilestone).toBe(
      "charter_exit_blocked",
    );
    expect(evaluation.firstProductSliceRequirements.length).toBeGreaterThan(0);
  });
});

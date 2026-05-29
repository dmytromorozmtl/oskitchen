import { describe, expect, it } from "vitest";

import { evaluateScaleReadinessIntegrity as evaluateFromScript } from "../../scripts/ops/validate-scale-readiness-integrity";

describe("validate-scale-readiness-integrity", () => {
  it("exports evaluate from ops script", () => {
    const result = evaluateFromScript(process.cwd(), { goNoGoOverride: null });
    expect(result.policyId).toBe("era30-scale-readiness-integrity-v1");
    expect(
      result.recommendedCommands.some((command) =>
        command.includes("validate-scale-readiness-integrity"),
      ),
    ).toBe(true);
  });
});

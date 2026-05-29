import { describe, expect, it } from "vitest";

import { evaluateContinuousImprovementLoopIntegrity as evaluateFromScript } from "../../scripts/ops/validate-continuous-improvement-loop-integrity";

describe("validate-continuous-improvement-loop-integrity", () => {
  it("exports evaluate from ops script", () => {
    const result = evaluateFromScript(process.cwd(), { goNoGoOverride: null });
    expect(result.policyId).toBe("era34-continuous-improvement-loop-integrity-v1");
    expect(
      result.recommendedCommands.some((command) =>
        command.includes("validate-continuous-improvement-loop-integrity"),
      ),
    ).toBe(true);
  });
});

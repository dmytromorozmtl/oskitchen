import { describe, expect, it } from "vitest";

import { evaluatePilotWeek1ExecutionIntegrity as evaluateFromScript } from "../../scripts/ops/validate-pilot-week1-execution-integrity";

describe("validate-pilot-week1-execution-integrity", () => {
  it("exports evaluate from ops script", () => {
    const result = evaluateFromScript(process.cwd(), { goNoGoOverride: null });
    expect(result.policyId).toBe("era28-pilot-week1-execution-integrity-v1");
    expect(
      result.recommendedCommands.some((command) =>
        command.includes("validate-pilot-week1-execution-integrity"),
      ),
    ).toBe(true);
  });
});

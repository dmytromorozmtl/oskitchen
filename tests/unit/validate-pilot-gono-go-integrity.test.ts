import { describe, expect, it } from "vitest";

import { evaluatePilotGoNoGoIntegrity as evaluateFromScript } from "../../scripts/ops/validate-pilot-gono-go-integrity";

describe("validate-pilot-gono-go-integrity", () => {
  it("exports evaluate from ops script", () => {
    const result = evaluateFromScript(process.cwd(), { artifactOverride: null });
    expect(result.policyId).toBe("era28-pilot-gono-go-integrity-v1");
    expect(
      result.recommendedCommands.some((command) =>
        command.includes("validate-pilot-gono-go-integrity"),
      ),
    ).toBe(true);
  });
});

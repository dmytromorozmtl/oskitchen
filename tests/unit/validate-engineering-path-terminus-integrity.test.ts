import { describe, expect, it } from "vitest";

import { evaluateEngineeringPathTerminusIntegrity as evaluateFromScript } from "../../scripts/ops/validate-engineering-path-terminus-integrity";

describe("validate-engineering-path-terminus-integrity", () => {
  it("exports evaluate from ops script", () => {
    const result = evaluateFromScript(process.cwd(), { goNoGoOverride: null });
    expect(result.policyId).toBe("era37-engineering-path-terminus-integrity-v1");
    expect(
      result.recommendedCommands.some((command) =>
        command.includes("validate-engineering-path-terminus-integrity"),
      ),
    ).toBe(true);
  });
});

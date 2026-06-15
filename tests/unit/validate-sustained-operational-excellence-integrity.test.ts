import { describe, expect, it } from "vitest";

import { evaluateSustainedOperationalExcellenceIntegrity as evaluateFromScript } from "../../scripts/ops/validate-sustained-operational-excellence-integrity";

describe("validate-sustained-operational-excellence-integrity", () => {
  it("exports evaluate from ops script", () => {
    const result = evaluateFromScript(process.cwd(), { goNoGoOverride: null });
    expect(result.policyId).toBe("era33-sustained-operational-excellence-integrity-v1");
    expect(
      result.recommendedCommands.some((command) =>
        command.includes("validate-sustained-operational-excellence-integrity"),
      ),
    ).toBe(true);
  });
});

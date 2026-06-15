import { describe, expect, it } from "vitest";

import { evaluateSeriesAPartnerExpansionIntegrity as evaluateFromScript } from "../../scripts/ops/validate-series-a-partner-expansion-integrity";

describe("validate-series-a-partner-expansion-integrity", () => {
  it("exports evaluate from ops script", () => {
    const result = evaluateFromScript(process.cwd(), { goNoGoOverride: null });
    expect(result.policyId).toBe("era31-series-a-partner-expansion-integrity-v1");
    expect(
      result.recommendedCommands.some((command) =>
        command.includes("validate-series-a-partner-expansion-integrity"),
      ),
    ).toBe(true);
  });
});

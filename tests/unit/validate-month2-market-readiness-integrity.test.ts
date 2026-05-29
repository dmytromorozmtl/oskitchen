import { describe, expect, it } from "vitest";

import { evaluateMonth2MarketReadinessIntegrity as evaluateFromScript } from "../../scripts/ops/validate-month2-market-readiness-integrity";

describe("validate-month2-market-readiness-integrity", () => {
  it("exports evaluate from ops script", () => {
    const result = evaluateFromScript(process.cwd(), { goNoGoOverride: null });
    expect(result.policyId).toBe("era29-month2-market-readiness-integrity-v1");
    expect(
      result.recommendedCommands.some((command) =>
        command.includes("validate-month2-market-readiness-integrity"),
      ),
    ).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import { evaluateMarketLeaderPositioningIntegrity as evaluateFromScript } from "../../scripts/ops/validate-market-leader-positioning-integrity";

describe("validate-market-leader-positioning-integrity", () => {
  it("exports evaluate from ops script", () => {
    const result = evaluateFromScript(process.cwd(), { goNoGoOverride: null });
    expect(result.policyId).toBe("era32-market-leader-positioning-integrity-v1");
    expect(
      result.recommendedCommands.some((command) =>
        command.includes("validate-market-leader-positioning-integrity"),
      ),
    ).toBe(true);
  });
});

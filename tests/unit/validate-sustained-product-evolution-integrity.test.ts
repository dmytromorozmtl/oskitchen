import { describe, expect, it } from "vitest";

import { evaluateSustainedProductEvolutionIntegrity as evaluateFromScript } from "../../scripts/ops/validate-sustained-product-evolution-integrity";

describe("validate-sustained-product-evolution-integrity", () => {
  it("exports evaluate from ops script", () => {
    const result = evaluateFromScript(process.cwd(), { goNoGoOverride: null });
    expect(result.policyId).toBe("era35-sustained-product-evolution-integrity-v1");
    expect(
      result.recommendedCommands.some((command) =>
        command.includes("validate-sustained-product-evolution-integrity"),
      ),
    ).toBe(true);
  });
});

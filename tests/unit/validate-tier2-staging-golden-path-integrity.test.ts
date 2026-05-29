import { describe, expect, it } from "vitest";

import { evaluateTier2StagingGoldenPathIntegrity as evaluateFromScript } from "../../scripts/ops/validate-tier2-staging-golden-path-integrity";

describe("validate-tier2-staging-golden-path-integrity", () => {
  it("exports evaluate from ops script", () => {
    const result = evaluateFromScript(process.cwd(), { artifactOverride: null });
    expect(result.policyId).toBe("era28-tier2-staging-golden-path-integrity-v1");
    expect(
      result.recommendedCommands.some((command) =>
        command.includes("validate-tier2-staging-golden-path-integrity"),
      ),
    ).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import { evaluatePostTerminusSteadyStateIntegrity as evaluateFromScript } from "../../scripts/ops/validate-post-terminus-steady-state-integrity";

describe("validate-post-terminus-steady-state-integrity", () => {
  it("exports evaluate from ops script", () => {
    const result = evaluateFromScript(process.cwd(), { goNoGoOverride: null });
    expect(result.policyId).toBe("era38-post-terminus-steady-state-integrity-v1");
    expect(
      result.recommendedCommands.some((command) =>
        command.includes("validate-post-terminus-steady-state-integrity"),
      ),
    ).toBe(true);
  });
});

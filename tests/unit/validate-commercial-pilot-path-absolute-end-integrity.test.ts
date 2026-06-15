import { describe, expect, it } from "vitest";

import { evaluateCommercialPilotPathAbsoluteEndIntegrity as evaluateFromScript } from "../../scripts/ops/validate-commercial-pilot-path-absolute-end-integrity";

describe("validate-commercial-pilot-path-absolute-end-integrity", () => {
  it("exports evaluate from ops script", () => {
    const result = evaluateFromScript(process.cwd(), { goNoGoOverride: null });
    expect(result.policyId).toBe("era39-commercial-pilot-path-absolute-end-integrity-v1");
    expect(
      result.recommendedCommands.some((command) =>
        command.includes("validate-commercial-pilot-path-absolute-end-integrity"),
      ),
    ).toBe(true);
  });
});

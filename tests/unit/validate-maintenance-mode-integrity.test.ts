import { describe, expect, it } from "vitest";

import { evaluateMaintenanceModeIntegrity as evaluateFromScript } from "../../scripts/ops/validate-maintenance-mode-integrity";

describe("validate-maintenance-mode-integrity", () => {
  it("exports evaluate from ops script", () => {
    const result = evaluateFromScript(process.cwd(), { goNoGoOverride: null });
    expect(result.policyId).toBe("era36-maintenance-mode-integrity-v1");
    expect(
      result.recommendedCommands.some((command) =>
        command.includes("validate-maintenance-mode-integrity"),
      ),
    ).toBe(true);
  });
});

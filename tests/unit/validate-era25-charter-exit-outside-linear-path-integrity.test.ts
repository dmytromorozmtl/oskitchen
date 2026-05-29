import { describe, expect, it } from "vitest";

import { evaluateEra25CharterExitOutsideLinearPathIntegrity } from "@/scripts/ops/validate-era25-charter-exit-outside-linear-path-integrity";

describe("validate-era25-charter-exit-outside-linear-path-integrity", () => {
  it("exports evaluator for ops script", () => {
    const result = evaluateEra25CharterExitOutsideLinearPathIntegrity(process.cwd(), { env: {} });
    expect(result.policyId).toBe("era42-era25-charter-exit-outside-linear-path-integrity-v1");
    expect(Array.isArray(result.recommendedCommands)).toBe(true);
  });
});

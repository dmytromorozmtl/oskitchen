import { describe, expect, it } from "vitest";

import { evaluateEra25EngineeringGatesIntegrity } from "@/scripts/ops/validate-era25-engineering-gates-integrity";

describe("validate-era25-engineering-gates-integrity", () => {
  it("exports evaluator for ops script", () => {
    const result = evaluateEra25EngineeringGatesIntegrity(process.cwd(), { env: {} });
    expect(result.policyId).toBe("era44-era25-engineering-gates-integrity-v1");
    expect(Array.isArray(result.recommendedCommands)).toBe(true);
  });
});

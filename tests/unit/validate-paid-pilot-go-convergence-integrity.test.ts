import { describe, expect, it } from "vitest";

import { evaluatePaidPilotGoConvergenceIntegrity } from "@/scripts/ops/validate-paid-pilot-go-convergence-integrity";

describe("validate-paid-pilot-go-convergence-integrity", () => {
  it("exports evaluator for ops script", () => {
    const result = evaluatePaidPilotGoConvergenceIntegrity(process.cwd(), { env: {} });
    expect(result.policyId).toBe("era47-paid-pilot-go-convergence-integrity-v1");
    expect(Array.isArray(result.recommendedCommands)).toBe(true);
  });
});

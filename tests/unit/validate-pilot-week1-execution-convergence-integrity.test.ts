import { describe, expect, it } from "vitest";

import { evaluatePilotWeek1ExecutionConvergenceIntegrity } from "@/scripts/ops/validate-pilot-week1-execution-convergence-integrity";

describe("validate-pilot-week1-execution-convergence-integrity", () => {
  it("exports evaluator for ops script", () => {
    const result = evaluatePilotWeek1ExecutionConvergenceIntegrity(process.cwd(), { env: {} });
    expect(result.policyId).toBe("era48-pilot-week1-execution-convergence-integrity-v1");
    expect(Array.isArray(result.recommendedCommands)).toBe(true);
  });
});

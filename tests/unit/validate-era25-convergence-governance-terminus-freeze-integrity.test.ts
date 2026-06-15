import { describe, expect, it } from "vitest";

import { evaluateEra25ConvergenceGovernanceTerminusFreezeIntegrity } from "@/scripts/ops/validate-era25-convergence-governance-terminus-freeze-integrity";

describe("validate-era25-convergence-governance-terminus-freeze-integrity", () => {
  it("re-exports era60 evaluator", () => {
    const result = evaluateEra25ConvergenceGovernanceTerminusFreezeIntegrity(process.cwd(), {
      env: {},
    });
    expect(result.policyId).toBe("era60-era25-convergence-governance-terminus-freeze-integrity-v1");
  });
});

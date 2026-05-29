import { describe, expect, it } from "vitest";

import { evaluateEra25CommercialPilotConvergenceTrainCapstoneIntegrity } from "@/scripts/ops/validate-era25-commercial-pilot-convergence-train-capstone-integrity";

describe("validate-era25-commercial-pilot-convergence-train-capstone-integrity", () => {
  it("re-exports era59 evaluator", () => {
    const result = evaluateEra25CommercialPilotConvergenceTrainCapstoneIntegrity(process.cwd(), {
      env: {},
    });
    expect(result.policyId).toBe(
      "era59-era25-commercial-pilot-convergence-train-capstone-integrity-v1",
    );
  });
});

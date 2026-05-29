import { describe, expect, it } from "vitest";

import { evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity } from "@/scripts/ops/validate-era25-commercial-pilot-convergence-train-closure-integrity";

describe("validate-era25-commercial-pilot-convergence-train-closure-integrity script export", () => {
  it("re-exports era55 evaluator", () => {
    const result = evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity(process.cwd(), {
      env: {},
    });
    expect(result.policyId).toBe(
      "era55-era25-commercial-pilot-convergence-train-closure-integrity-v1",
    );
  });
});

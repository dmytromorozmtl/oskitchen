import { describe, expect, it } from "vitest";

import { evaluateSustainedOperationalExcellenceConvergenceIntegrity } from "@/scripts/ops/validate-sustained-operational-excellence-convergence-integrity";

describe("validate-sustained-operational-excellence-convergence-integrity script export", () => {
  it("re-exports era53 evaluator", () => {
    const result = evaluateSustainedOperationalExcellenceConvergenceIntegrity(process.cwd(), {
      env: {},
    });
    expect(result.policyId).toBe("era53-sustained-operational-excellence-convergence-integrity-v1");
  });
});

import { describe, expect, it } from "vitest";

import { evaluatePureOperationalModeTerminusConvergenceIntegrity } from "@/scripts/ops/validate-pure-operational-mode-terminus-convergence-integrity";

describe("validate-pure-operational-mode-terminus-convergence-integrity script export", () => {
  it("re-exports era54 evaluator", () => {
    const result = evaluatePureOperationalModeTerminusConvergenceIntegrity(process.cwd(), {
      env: {},
    });
    expect(result.policyId).toBe("era54-pure-operational-mode-terminus-convergence-integrity-v1");
  });
});

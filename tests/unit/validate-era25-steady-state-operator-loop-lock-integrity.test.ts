import { describe, expect, it } from "vitest";

import { evaluateEra25SteadyStateOperatorLoopLockIntegrity } from "@/scripts/ops/validate-era25-steady-state-operator-loop-lock-integrity";

describe("validate-era25-steady-state-operator-loop-lock-integrity", () => {
  it("re-exports era58 evaluator", () => {
    const result = evaluateEra25SteadyStateOperatorLoopLockIntegrity(process.cwd(), {
      env: {},
    });
    expect(result.policyId).toBe("era58-era25-steady-state-operator-loop-lock-integrity-v1");
  });
});

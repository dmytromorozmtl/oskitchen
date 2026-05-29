import { describe, expect, it } from "vitest";

import { evaluateScaleReadinessConvergenceIntegrity } from "@/scripts/ops/validate-scale-readiness-convergence-integrity";

describe("validate-scale-readiness-convergence-integrity script export", () => {
  it("re-exports era50 evaluator", () => {
    const result = evaluateScaleReadinessConvergenceIntegrity(process.cwd(), { env: {} });
    expect(result.policyId).toBe("era50-scale-readiness-convergence-integrity-v1");
  });
});

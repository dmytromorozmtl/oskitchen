import { describe, expect, it } from "vitest";

import { evaluateMonth2MarketReadinessConvergenceIntegrity } from "@/scripts/ops/validate-month2-market-readiness-convergence-integrity";

describe("validate-month2-market-readiness-convergence-integrity script export", () => {
  it("re-exports era49 evaluator", () => {
    const result = evaluateMonth2MarketReadinessConvergenceIntegrity(process.cwd(), { env: {} });
    expect(result.policyId).toBe("era49-month2-market-readiness-convergence-integrity-v1");
  });
});

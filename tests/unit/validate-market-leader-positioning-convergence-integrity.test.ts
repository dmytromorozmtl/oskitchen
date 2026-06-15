import { describe, expect, it } from "vitest";

import { evaluateMarketLeaderPositioningConvergenceIntegrity } from "@/scripts/ops/validate-market-leader-positioning-convergence-integrity";

describe("validate-market-leader-positioning-convergence-integrity script export", () => {
  it("re-exports era52 evaluator", () => {
    const result = evaluateMarketLeaderPositioningConvergenceIntegrity(process.cwd(), { env: {} });
    expect(result.policyId).toBe("era52-market-leader-positioning-convergence-integrity-v1");
  });
});

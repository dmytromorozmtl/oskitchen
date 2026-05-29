import { describe, expect, it } from "vitest";

import { evaluateEra25P0MarketProofHonestClosureCapstoneIntegrity } from "@/scripts/ops/validate-era25-p0-market-proof-honest-closure-capstone-integrity";

describe("validate-era25-p0-market-proof-honest-closure-capstone-integrity", () => {
  it("re-exports era62 evaluator", () => {
    const result = evaluateEra25P0MarketProofHonestClosureCapstoneIntegrity(process.cwd(), {
      env: {},
    });
    expect(result.policyId).toBe("era62-era25-p0-market-proof-honest-closure-capstone-integrity-v1");
  });
});

import { describe, expect, it } from "vitest";

import { evaluateSustainedProductEvolutionReentrantIntegrity } from "@/scripts/ops/validate-sustained-product-evolution-re-entrant-integrity";

describe("validate-sustained-product-evolution-re-entrant-integrity script export", () => {
  it("re-exports era56 evaluator", () => {
    const result = evaluateSustainedProductEvolutionReentrantIntegrity(process.cwd(), {
      env: {},
    });
    expect(result.policyId).toBe("era56-sustained-product-evolution-re-entrant-integrity-v1");
  });
});

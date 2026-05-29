import { describe, expect, it } from "vitest";

import { evaluateSustainedProductEvolution } from "../../scripts/ops/validate-sustained-product-evolution";

describe("validate-sustained-product-evolution", () => {
  it("evaluates without throwing", () => {
    expect(() => evaluateSustainedProductEvolution({})).not.toThrow();
  });

  it("reports not ready with honest NO-GO", () => {
    const result = evaluateSustainedProductEvolution({});
    expect(result.productEvolutionReady).toBe(false);
    expect(result.tracks).toHaveLength(6);
    expect(result.productEvolutionMilestone).toBe("improvement_loop_blocked");
  });
});

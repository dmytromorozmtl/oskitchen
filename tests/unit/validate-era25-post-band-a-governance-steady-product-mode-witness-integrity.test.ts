import { describe, expect, it } from "vitest";

import { evaluateEra25PostBandAGovernanceSteadyProductModeWitnessIntegrity } from "@/scripts/ops/validate-era25-post-band-a-governance-steady-product-mode-witness-integrity";

describe("validate-era25-post-band-a-governance-steady-product-mode-witness-integrity script export", () => {
  it("re-exports evaluator", () => {
    const result = evaluateEra25PostBandAGovernanceSteadyProductModeWitnessIntegrity(process.cwd(), {
      env: {},
    });
    expect(result.policyId).toBe(
      "era67-era25-post-band-a-governance-steady-product-mode-witness-integrity-v1",
    );
  });
});

import { describe, expect, it } from "vitest";

import { evaluateEra25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrity } from "@/scripts/ops/validate-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity";

describe("validate-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity script export", () => {
  it("re-exports evaluator", () => {
    const result = evaluateEra25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrity(
      process.cwd(),
      { env: {} },
    );
    expect(result.policyId).toBe(
      "era68-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-v1",
    );
  });
});

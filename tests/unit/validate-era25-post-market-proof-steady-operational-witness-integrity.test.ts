import { describe, expect, it } from "vitest";

import { evaluateEra25PostMarketProofSteadyOperationalWitnessIntegrity } from "@/scripts/ops/validate-era25-post-market-proof-steady-operational-witness-integrity";

describe("validate-era25-post-market-proof-steady-operational-witness-integrity script export", () => {
  it("re-exports evaluator", () => {
    const result = evaluateEra25PostMarketProofSteadyOperationalWitnessIntegrity(process.cwd(), {
      env: {},
    });
    expect(result.policyId).toBe(
      "era63-era25-post-market-proof-steady-operational-witness-integrity-v1",
    );
  });
});

import { describe, expect, it } from "vitest";

import { evaluateEra25BandAGovernanceChainCapstoneWitnessIntegrity } from "@/scripts/ops/validate-era25-band-a-governance-chain-capstone-witness-integrity";

describe("validate-era25-band-a-governance-chain-capstone-witness-integrity script export", () => {
  it("re-exports evaluator", () => {
    const result = evaluateEra25BandAGovernanceChainCapstoneWitnessIntegrity(process.cwd(), {
      env: {},
    });
    expect(result.policyId).toBe(
      "era66-era25-band-a-governance-chain-capstone-witness-integrity-v1",
    );
  });
});

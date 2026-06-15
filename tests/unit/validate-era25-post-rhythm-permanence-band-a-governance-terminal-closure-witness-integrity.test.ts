import { describe, expect, it } from "vitest";

import { evaluateEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrity } from "@/scripts/ops/validate-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity";

describe("validate-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity script export", () => {
  it("re-exports evaluator", () => {
    const result = evaluateEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrity(
      process.cwd(),
      { env: {} },
    );
    expect(result.policyId).toBe(
      "era69-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity-v1",
    );
  });
});

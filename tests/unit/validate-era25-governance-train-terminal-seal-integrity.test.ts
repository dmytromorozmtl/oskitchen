import { describe, expect, it } from "vitest";

import { evaluateEra25GovernanceTrainTerminalSealIntegrity } from "@/scripts/ops/validate-era25-governance-train-terminal-seal-integrity";

describe("validate-era25-governance-train-terminal-seal-integrity script export", () => {
  it("re-exports evaluator", () => {
    const result = evaluateEra25GovernanceTrainTerminalSealIntegrity(process.cwd(), {
      env: {},
    });
    expect(result.policyId).toBe("era64-era25-governance-train-terminal-seal-integrity-v1");
  });
});

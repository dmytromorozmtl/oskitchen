import { describe, expect, it } from "vitest";

import { evaluateP0StagingProofIntegrity } from "@/lib/commercial/p0-staging-proof-integrity-era28";
import { evaluateP0StagingProofIntegrity as evaluateFromScript } from "../../scripts/ops/validate-p0-staging-proof-integrity";

describe("validate-p0-staging-proof-integrity", () => {
  it("re-exports evaluate without throwing", () => {
    expect(() => evaluateFromScript()).not.toThrow();
  });

  it("returns policy id and recommended commands", () => {
    const result = evaluateP0StagingProofIntegrity();
    expect(result.policyId).toBe("era28-p0-staging-proof-integrity-v1");
    expect(result.recommendedCommands[0]).toContain("validate-p0-staging-proof-integrity");
  });
});

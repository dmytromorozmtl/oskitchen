import { describe, expect, it } from "vitest";

import { evaluateLinearChainTerminusGuardIntegrity } from "@/scripts/ops/validate-linear-chain-terminus-guard-integrity";

describe("validate-linear-chain-terminus-guard-integrity", () => {
  it("exports evaluate from ops script", () => {
    const result = evaluateLinearChainTerminusGuardIntegrity();
    expect(result.policyId).toBe("era41-linear-chain-terminus-guard-integrity-v1");
    expect(typeof result.integrityPassed).toBe("boolean");
  });
});

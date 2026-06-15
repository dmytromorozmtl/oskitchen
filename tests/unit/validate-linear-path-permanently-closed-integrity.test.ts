import { describe, expect, it } from "vitest";

import { evaluateLinearPathPermanentlyClosedIntegrity } from "@/scripts/ops/validate-linear-path-permanently-closed-integrity";

describe("validate-linear-path-permanently-closed-integrity", () => {
  it("exports evaluate from ops script", () => {
    const result = evaluateLinearPathPermanentlyClosedIntegrity();
    expect(result.policyId).toBe("era40-linear-path-permanently-closed-integrity-v1");
    expect(typeof result.integrityPassed).toBe("boolean");
  });
});

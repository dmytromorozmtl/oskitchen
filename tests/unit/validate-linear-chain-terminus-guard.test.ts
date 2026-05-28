import { describe, expect, it } from "vitest";

import { evaluateLinearChainTerminusGuard } from "@/lib/commercial/linear-chain-terminus-guard-era24";

describe("validate-linear-chain-terminus-guard", () => {
  it("evaluates without throwing", () => {
    expect(() => evaluateLinearChainTerminusGuard()).not.toThrow();
  });

  it("reports guard PASS for repo integrity", () => {
    const result = evaluateLinearChainTerminusGuard();
    expect(result.guardPassed).toBe(true);
    expect(result.step18DocPresent).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import {
  detectLinearChainTerminusGuardStarted,
  LINEAR_CHAIN_MAX_STEP,
  LINEAR_CHAIN_STEP17_FORBIDDEN_DOC,
  evaluateLinearChainTerminusGuard,
} from "@/lib/commercial/linear-chain-terminus-guard-era24";

describe("linear-chain-terminus-guard-era24", () => {
  it("passes guard with 16-step catalog and forbidden doc", () => {
    const result = evaluateLinearChainTerminusGuard();
    expect(result.step17Forbidden).toBe(true);
    expect(result.maxLinearStep).toBe(LINEAR_CHAIN_MAX_STEP);
    expect(result.catalogStepCount).toBe(16);
    expect(result.forbiddenDocPresent).toBe(true);
    expect(result.guardPassed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("locks step 17 forbidden doc path", () => {
    expect(LINEAR_CHAIN_STEP17_FORBIDDEN_DOC).toContain("next-step-17-forbidden");
  });

  it("detects terminus guard started from env attestations", () => {
    expect(
      detectLinearChainTerminusGuardStarted({
        LINEAR_CHAIN_TERMINUS_GUARD_STEP17_FORBIDDEN_ATTESTED: "true",
      }),
    ).toBe(true);
    expect(detectLinearChainTerminusGuardStarted({})).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import {
  buildCommercialGoClosurePhaseStatuses,
  resolveCommercialGoClosurePrerequisites,
  resolveNextIncompleteCommercialGoClosurePhase,
} from "@/lib/commercial/commercial-go-closure-phases-era21";

describe("commercial-go-closure-phases-era21", () => {
  it("requires P0 and Tier2 proof_passed for prerequisites", () => {
    expect(
      resolveCommercialGoClosurePrerequisites({
        p0ProofStatus: "proof_passed",
        tier2ProofStatus: "awaiting_manual_phases",
      }).prerequisitesComplete,
    ).toBe(false);
    expect(
      resolveCommercialGoClosurePrerequisites({
        p0ProofStatus: "proof_passed",
        tier2ProofStatus: "proof_passed",
      }).prerequisitesComplete,
    ).toBe(true);
  });

  it("builds five phases after prerequisites", () => {
    const phases = buildCommercialGoClosurePhaseStatuses({
      prerequisites: resolveCommercialGoClosurePrerequisites({
        p0ProofStatus: "proof_passed",
        tier2ProofStatus: "proof_passed",
      }),
      goNoGoSummary: null,
      env: {},
    });
    expect(phases).toHaveLength(5);
    expect(phases[0]?.complete).toBe(true);
    expect(resolveNextIncompleteCommercialGoClosurePhase(phases)?.id).toBe("icp_qualification");
  });
});

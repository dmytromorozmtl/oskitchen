import { describe, expect, it } from "vitest";

import {
  buildTier2GoldenPathPhaseStatuses,
  resolveNextIncompleteTier2GoldenPathPhase,
} from "@/lib/commercial/tier2-staging-golden-path-phases-era21";
import { buildTier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

describe("tier2-staging-golden-path-phases-era21", () => {
  it("builds four phases from artifact", () => {
    const summary = buildTier2StagingGoldenPathSummary({
      p0ProofStatus: "proof_passed",
      p0GateStep: {
        id: "p0_proof_gate",
        label: "P0",
        kind: "p0_gate",
        status: "PASSED",
        reason: "ok",
      },
      childSteps: [],
    });
    const phases = buildTier2GoldenPathPhaseStatuses({ tier2Summary: summary });
    expect(phases).toHaveLength(4);
    expect(resolveNextIncompleteTier2GoldenPathPhase(phases)?.id).toBe("automated_child_smokes");
  });
});

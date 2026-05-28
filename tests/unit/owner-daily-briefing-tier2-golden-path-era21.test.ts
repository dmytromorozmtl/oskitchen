import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingTier2GoldenPathAction,
  TIER2_GOLDEN_PATH_BRIEFING_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-tier2-golden-path-era21";
import { buildTier2GoldenPathUiSlice } from "@/lib/commercial/tier2-staging-golden-path-ui-era21";
import { buildTier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

describe("owner-daily-briefing-tier2-golden-path-era21", () => {
  it("builds ranked action when tier2 blocked after P0 pass", () => {
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
    const slice = buildTier2GoldenPathUiSlice({
      p0ProofStatus: "proof_passed",
      tier2Summary: summary,
    });
    const action = buildOwnerDailyBriefingTier2GoldenPathAction(slice);
    expect(action?.priority).toBe(TIER2_GOLDEN_PATH_BRIEFING_ACTION_PRIORITY);
    expect(action?.title).toContain("Tier 2");
  });
});

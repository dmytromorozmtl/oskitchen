import { describe, expect, it } from "vitest";

import {
  buildTier2GoldenPathUiSlice,
  formatTier2GoldenPathProgressLabel,
} from "@/lib/commercial/tier2-staging-golden-path-ui-era21";
import { buildTier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

describe("tier2-golden-path-ui-era21", () => {
  it("visible when P0 passed and tier2 not passed", () => {
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
    expect(slice?.blocked).toBe(true);
    expect(slice?.phases.length).toBe(4);
    expect(formatTier2GoldenPathProgressLabel(slice!)).toContain("Tier 2");
  });

  it("hidden when P0 not passed", () => {
    expect(
      buildTier2GoldenPathUiSlice({
        p0ProofStatus: "awaiting_ops_credentials",
        tier2Summary: null,
      }),
    ).toBeNull();
  });
});

import { describe, expect, it } from "vitest";

import { buildScaleReadinessConvergenceEra25UiSlice } from "@/lib/commercial/scale-readiness-convergence-ui-era25";
import {
  buildLaunchWizardEra25MarketLeaderPositioningConvergenceSlice,
  launchWizardEra25MarketLeaderPositioningConvergenceHref,
} from "@/lib/launch-wizard/launch-wizard-era25-market-leader-positioning-convergence-era52";

describe("launch-wizard-era25-market-leader-positioning-convergence-era52", () => {
  it("builds slice when market leader train active with integrity flags", () => {
    const scale = buildScaleReadinessConvergenceEra25UiSlice({
      month2ConvergenceVisible: true,
      env: { MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_ATTESTED: "1" },
      goNoGoSummary: {
        version: "era17-pilot-gono-go-v1",
        runAt: new Date().toISOString(),
        decision: "GO",
        blockers: [],
        warnings: [],
        customerExecutionStatus: "recorded",
        customerName: "Acme",
        loiSignedDate: "2026-06-01",
        prospectExecutionStatus: "none",
        prospectName: null,
        icpQualification: { qualified: true, missingCriteria: [], disqualifiers: [] },
        evidenceGates: [],
        evaluatorInput: {
          tier0Pass: true,
          tier1Pass: true,
          tier2Pass: true,
          tier3Pass: true,
          roleChecklistsComplete: true,
          forbiddenClaimsInContract: false,
          icpQualified: true,
          stagingUrl: "https://x.example.com",
          commitSha: "abc",
        },
      },
      p0ProofStatus: "proof_passed",
      tier2ProofStatus: "proof_passed",
    });
    const marketLeader =
      scale?.seriesAPartnerExpansionConvergence?.marketLeaderPositioningConvergence ?? null;
    const slice = buildLaunchWizardEra25MarketLeaderPositioningConvergenceSlice(marketLeader, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.marketLeaderPositioningConvergenceIntegrityFailed).toBe(true);
    expect(launchWizardEra25MarketLeaderPositioningConvergenceHref()).toContain(
      "#launch-wizard-era25-market-leader-positioning-convergence",
    );
  });
});

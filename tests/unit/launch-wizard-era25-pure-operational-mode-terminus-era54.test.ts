import { describe, expect, it } from "vitest";

import { buildMarketLeaderPositioningConvergenceEra25UiSlice } from "@/lib/commercial/market-leader-positioning-convergence-ui-era25";
import {
  buildLaunchWizardEra25PureOperationalModeTerminusSlice,
  launchWizardEra25PureOperationalModeTerminusHref,
} from "@/lib/launch-wizard/launch-wizard-era25-pure-operational-mode-terminus-era54";

describe("launch-wizard-era25-pure-operational-mode-terminus-era54", () => {
  it("builds slice when pure ops train active with integrity flags", () => {
    const marketLeader = buildMarketLeaderPositioningConvergenceEra25UiSlice({
      seriesAConvergenceVisible: true,
      env: { PURE_OPERATIONAL_MODE_TERMINUS_ERA25_ATTESTED: "1" },
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
    const pureOps =
      marketLeader?.sustainedOperationalExcellenceConvergence?.pureOperationalModeTerminus ?? null;
    const slice = buildLaunchWizardEra25PureOperationalModeTerminusSlice(pureOps, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.pureOperationalModeTerminusConvergenceIntegrityFailed).toBe(true);
    expect(launchWizardEra25PureOperationalModeTerminusHref()).toContain(
      "#launch-wizard-era25-pure-operational-mode-terminus",
    );
  });
});

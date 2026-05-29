import { describe, expect, it } from "vitest";

import { buildMarketLeaderPositioningConvergenceEra25UiSlice } from "@/lib/commercial/market-leader-positioning-convergence-ui-era25";
import {
  buildLaunchWizardEra25SustainedOperationalExcellenceConvergenceSlice,
  launchWizardEra25SustainedOperationalExcellenceConvergenceHref,
} from "@/lib/launch-wizard/launch-wizard-era25-sustained-operational-excellence-convergence-era53";

describe("launch-wizard-era25-sustained-operational-excellence-convergence-era53", () => {
  it("builds slice when sustained ops train active with integrity flags", () => {
    const marketLeader = buildMarketLeaderPositioningConvergenceEra25UiSlice({
      seriesAConvergenceVisible: true,
      env: { SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_ATTESTED: "1" },
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
    const sustained = marketLeader?.sustainedOperationalExcellenceConvergence ?? null;
    const slice = buildLaunchWizardEra25SustainedOperationalExcellenceConvergenceSlice(sustained, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.sustainedOperationalExcellenceConvergenceIntegrityFailed).toBe(true);
    expect(launchWizardEra25SustainedOperationalExcellenceConvergenceHref()).toContain(
      "#launch-wizard-era25-sustained-operational-excellence-convergence",
    );
  });
});

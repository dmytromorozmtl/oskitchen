import { describe, expect, it } from "vitest";

import { buildOwnerDailyBriefingBreakthroughEra25UiSlice } from "@/lib/commercial/owner-daily-briefing-breakthrough-ui-era25";
import {
  buildLaunchWizardEra25PaidPilotGoConvergenceSlice,
  launchWizardEra25PaidPilotGoConvergenceHref,
} from "@/lib/launch-wizard/launch-wizard-era25-paid-pilot-go-convergence-era47";

describe("launch-wizard-era25-paid-pilot-go-convergence-era47", () => {
  it("builds slice when convergence train active with integrity flags", () => {
    const breakthrough = buildOwnerDailyBriefingBreakthroughEra25UiSlice({
      blueprintVisible: true,
      env: { PAID_PILOT_GO_CONVERGENCE_ERA25_ATTESTED: "1" },
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
    const convergence = breakthrough?.paidPilotGoConvergence ?? null;
    const slice = buildLaunchWizardEra25PaidPilotGoConvergenceSlice(convergence, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.paidPilotGoConvergenceIntegrityFailed).toBe(true);
    expect(launchWizardEra25PaidPilotGoConvergenceHref()).toContain(
      "#launch-wizard-era25-paid-pilot-go-convergence",
    );
  });
});

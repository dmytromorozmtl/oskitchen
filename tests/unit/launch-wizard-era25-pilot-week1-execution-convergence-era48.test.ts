import { describe, expect, it } from "vitest";

import { buildPaidPilotGoConvergenceEra25UiSlice } from "@/lib/commercial/paid-pilot-go-convergence-ui-era25";
import {
  buildLaunchWizardEra25PilotWeek1ExecutionConvergenceSlice,
  launchWizardEra25PilotWeek1ExecutionConvergenceHref,
} from "@/lib/launch-wizard/launch-wizard-era25-pilot-week1-execution-convergence-era48";

describe("launch-wizard-era25-pilot-week1-execution-convergence-era48", () => {
  it("builds slice when week 1 train active with integrity flags", () => {
    const goConvergence = buildPaidPilotGoConvergenceEra25UiSlice({
      breakthroughVisible: true,
      env: { PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_ATTESTED: "1" },
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
    const week1 = goConvergence?.pilotWeek1ExecutionConvergence ?? null;
    const slice = buildLaunchWizardEra25PilotWeek1ExecutionConvergenceSlice(week1, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.pilotWeek1ExecutionConvergenceIntegrityFailed).toBe(true);
    expect(launchWizardEra25PilotWeek1ExecutionConvergenceHref()).toContain(
      "#launch-wizard-era25-pilot-week1-execution-convergence",
    );
  });
});

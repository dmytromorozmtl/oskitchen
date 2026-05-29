import { describe, expect, it } from "vitest";

import { buildPilotWeek1ExecutionConvergenceEra25UiSlice } from "@/lib/commercial/pilot-week1-execution-convergence-ui-era25";
import {
  buildLaunchWizardEra25Month2MarketReadinessConvergenceSlice,
  launchWizardEra25Month2MarketReadinessConvergenceHref,
} from "@/lib/launch-wizard/launch-wizard-era25-month2-market-readiness-convergence-era49";

describe("launch-wizard-era25-month2-market-readiness-convergence-era49", () => {
  it("builds slice when month 2 train active with integrity flags", () => {
    const week1 = buildPilotWeek1ExecutionConvergenceEra25UiSlice({
      goConvergenceVisible: true,
      env: { MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_ATTESTED: "1" },
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
    const month2 = week1?.month2MarketReadinessConvergence ?? null;
    const slice = buildLaunchWizardEra25Month2MarketReadinessConvergenceSlice(month2, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.month2MarketReadinessConvergenceIntegrityFailed).toBe(true);
    expect(launchWizardEra25Month2MarketReadinessConvergenceHref()).toContain(
      "#launch-wizard-era25-month2-market-readiness-convergence",
    );
  });
});

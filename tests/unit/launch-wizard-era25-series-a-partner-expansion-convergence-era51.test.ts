import { describe, expect, it } from "vitest";

import { buildScaleReadinessConvergenceEra25UiSlice } from "@/lib/commercial/scale-readiness-convergence-ui-era25";
import {
  buildLaunchWizardEra25SeriesAPartnerExpansionConvergenceSlice,
  launchWizardEra25SeriesAPartnerExpansionConvergenceHref,
} from "@/lib/launch-wizard/launch-wizard-era25-series-a-partner-expansion-convergence-era51";

describe("launch-wizard-era25-series-a-partner-expansion-convergence-era51", () => {
  it("builds slice when series A train active with integrity flags", () => {
    const scale = buildScaleReadinessConvergenceEra25UiSlice({
      month2ConvergenceVisible: true,
      env: { SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_ATTESTED: "1" },
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
    const seriesA = scale?.seriesAPartnerExpansionConvergence ?? null;
    const slice = buildLaunchWizardEra25SeriesAPartnerExpansionConvergenceSlice(seriesA, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.seriesAPartnerExpansionConvergenceIntegrityFailed).toBe(true);
    expect(launchWizardEra25SeriesAPartnerExpansionConvergenceHref()).toContain(
      "#launch-wizard-era25-series-a-partner-expansion-convergence",
    );
  });
});

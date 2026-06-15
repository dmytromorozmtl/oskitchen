import { describe, expect, it } from "vitest";

import { buildMonth2MarketReadinessConvergenceEra25UiSlice } from "@/lib/commercial/month2-market-readiness-convergence-ui-era25";
import {
  buildLaunchWizardEra25ScaleReadinessConvergenceSlice,
  launchWizardEra25ScaleReadinessConvergenceHref,
} from "@/lib/launch-wizard/launch-wizard-era25-scale-readiness-convergence-era50";

describe("launch-wizard-era25-scale-readiness-convergence-era50", () => {
  it("builds slice when scale train active with integrity flags", () => {
    const month2 = buildMonth2MarketReadinessConvergenceEra25UiSlice({
      week1ConvergenceVisible: true,
      env: { SCALE_READINESS_CONVERGENCE_ERA25_ATTESTED: "1" },
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
    const scale = month2?.scaleReadinessConvergence ?? null;
    const slice = buildLaunchWizardEra25ScaleReadinessConvergenceSlice(scale, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.scaleReadinessConvergenceIntegrityFailed).toBe(true);
    expect(launchWizardEra25ScaleReadinessConvergenceHref()).toContain(
      "#launch-wizard-era25-scale-readiness-convergence",
    );
  });
});

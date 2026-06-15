import { describe, expect, it } from "vitest";

import { buildContinuousImprovementLoopUiSlice } from "@/lib/commercial/continuous-improvement-loop-ui-era22";
import {
  buildLaunchWizardImprovementLoopSlice,
  launchWizardImprovementLoopHref,
} from "@/lib/launch-wizard/launch-wizard-improvement-loop-era34";

describe("launch-wizard-improvement-loop-era34", () => {
  it("builds slice when improvement loop train active with integrity flags", () => {
    const improvementLoop = buildContinuousImprovementLoopUiSlice({
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
      env: { CONTINUOUS_IMPROVEMENT_LOOP_PURE_MODE_ATTESTED: "1" },
    });
    const slice = buildLaunchWizardImprovementLoopSlice(improvementLoop);
    expect(slice).not.toBeNull();
    expect(slice!.progressLabel).toContain("tracks");
    expect(launchWizardImprovementLoopHref()).toContain("#launch-wizard-improvement-loop");
  });
});

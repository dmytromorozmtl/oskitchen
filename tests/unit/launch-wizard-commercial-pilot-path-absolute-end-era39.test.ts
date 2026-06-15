import { describe, expect, it } from "vitest";

import { buildCommercialPilotPathAbsoluteEndUiSlice } from "@/lib/commercial/commercial-pilot-path-absolute-end-ui-era24";
import {
  buildLaunchWizardCommercialPilotPathAbsoluteEndSlice,
  launchWizardCommercialPilotPathAbsoluteEndHref,
} from "@/lib/launch-wizard/launch-wizard-commercial-pilot-path-absolute-end-era39";

describe("launch-wizard-commercial-pilot-path-absolute-end-era39", () => {
  it("builds slice when absolute end train active with integrity flags", () => {
    const absoluteEnd = buildCommercialPilotPathAbsoluteEndUiSlice({
      steadyStateActive: true,
      env: { COMMERCIAL_PILOT_PATH_ABSOLUTE_END_PATH_CLOSURE_ATTESTED: "1" },
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
    const slice = buildLaunchWizardCommercialPilotPathAbsoluteEndSlice(absoluteEnd, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.progressLabel).toContain("steps");
    expect(slice!.commercialPilotPathAbsoluteEndIntegrityFailed).toBe(true);
    expect(launchWizardCommercialPilotPathAbsoluteEndHref()).toContain(
      "#launch-wizard-commercial-pilot-path-absolute-end",
    );
  });
});

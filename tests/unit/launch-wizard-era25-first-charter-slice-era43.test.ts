import { describe, expect, it } from "vitest";

import { buildEra25CharterExitUiSlice } from "@/lib/commercial/era25-charter-exit-ui-era24";
import {
  buildLaunchWizardEra25FirstCharterSliceSlice,
  launchWizardEra25FirstCharterSliceHref,
} from "@/lib/launch-wizard/launch-wizard-era25-first-charter-slice-era43";

describe("launch-wizard-era25-first-charter-slice-era43", () => {
  it("builds slice when first charter slice train active with integrity flags", () => {
    const charterExit = buildEra25CharterExitUiSlice({
      guardPassed: true,
      env: { ERA25_FIRST_CHARTER_SLICE_READINESS_ATTESTED: "1" },
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
    const firstSlice = charterExit?.firstCharterSliceReadiness ?? null;
    const slice = buildLaunchWizardEra25FirstCharterSliceSlice(firstSlice, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.progressLabel).toContain("sections");
    expect(slice!.era25FirstCharterSliceIntegrityFailed).toBe(true);
    expect(launchWizardEra25FirstCharterSliceHref()).toContain(
      "#launch-wizard-era25-first-charter-slice",
    );
  });
});

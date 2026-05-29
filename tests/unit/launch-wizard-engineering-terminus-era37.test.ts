import { describe, expect, it } from "vitest";

import { buildEngineeringPathTerminusUiSlice } from "@/lib/commercial/engineering-path-terminus-ui-era24";
import {
  buildLaunchWizardEngineeringTerminusSlice,
  launchWizardEngineeringTerminusHref,
} from "@/lib/launch-wizard/launch-wizard-engineering-terminus-era37";

describe("launch-wizard-engineering-terminus-era37", () => {
  it("builds slice when engineering path train active with integrity flags", () => {
    const engineeringTerminus = buildEngineeringPathTerminusUiSlice({
      maintenanceModeActive: true,
      env: { ENGINEERING_PATH_TERMINUS_MASTER_PATH_ATTESTED: "1" },
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
    const slice = buildLaunchWizardEngineeringTerminusSlice(engineeringTerminus, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.progressLabel).toContain("steps");
    expect(slice!.engineeringTerminusIntegrityFailed).toBe(true);
    expect(launchWizardEngineeringTerminusHref()).toContain("#launch-wizard-engineering-terminus");
  });
});

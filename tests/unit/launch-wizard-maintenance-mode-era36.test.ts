import { describe, expect, it } from "vitest";

import { buildMaintenanceModeUiSlice } from "@/lib/commercial/maintenance-mode-ui-era24";
import {
  buildLaunchWizardMaintenanceModeSlice,
  launchWizardMaintenanceModeHref,
} from "@/lib/launch-wizard/launch-wizard-maintenance-mode-era36";

describe("launch-wizard-maintenance-mode-era36", () => {
  it("builds slice when maintenance mode train active with integrity flags", () => {
    const maintenanceMode = buildMaintenanceModeUiSlice({
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
      env: { MAINTENANCE_MODE_COMMERCIAL_PILOT_PATH_ATTESTED: "1" },
    });
    const slice = buildLaunchWizardMaintenanceModeSlice(maintenanceMode);
    expect(slice).not.toBeNull();
    expect(slice!.progressLabel).toContain("rhythms");
    expect(launchWizardMaintenanceModeHref()).toContain("#launch-wizard-maintenance-mode");
  });
});

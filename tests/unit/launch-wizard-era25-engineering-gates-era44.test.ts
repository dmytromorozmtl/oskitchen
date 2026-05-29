import { describe, expect, it } from "vitest";

import { buildEra25FirstCharterSliceReadinessUiSlice } from "@/lib/commercial/era25-first-charter-slice-readiness-ui-era24";
import {
  buildLaunchWizardEra25EngineeringGatesSlice,
  launchWizardEra25EngineeringGatesHref,
} from "@/lib/launch-wizard/launch-wizard-era25-engineering-gates-era44";

describe("launch-wizard-era25-engineering-gates-era44", () => {
  it("builds slice when engineering gates train active with integrity flags", () => {
    const firstSlice = buildEra25FirstCharterSliceReadinessUiSlice({
      charterExitVisible: true,
      env: { ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ATTESTED: "1" },
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
    const gates = firstSlice?.engineeringGates ?? null;
    const slice = buildLaunchWizardEra25EngineeringGatesSlice(gates, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.progressLabel).toContain("attention");
    expect(slice!.era25EngineeringGatesIntegrityFailed).toBe(true);
    expect(launchWizardEra25EngineeringGatesHref()).toContain(
      "#launch-wizard-era25-engineering-gates",
    );
  });
});

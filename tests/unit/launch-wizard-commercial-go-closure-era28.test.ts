import { describe, expect, it } from "vitest";

import { buildCommercialGoClosureUiSlice } from "@/lib/commercial/commercial-go-closure-ui-era21";
import {
  buildLaunchWizardCommercialGoClosureSlice,
  launchWizardCommercialGoClosureHref,
} from "@/lib/launch-wizard/launch-wizard-commercial-go-closure-era28";

describe("launch-wizard-commercial-go-closure-era28", () => {
  it("surfaces integrity panel when artifact claims fake GO", () => {
    const goClosure = buildCommercialGoClosureUiSlice({
      p0ProofStatus: "proof_passed",
      tier2ProofStatus: "proof_passed",
      goNoGoSummary: {
        version: "era17-pilot-gono-go-v1",
        runAt: "2026-05-28T00:00:00.000Z",
        decision: "GO",
        blockers: ["No signed LOI"],
        warnings: [],
        customerExecutionStatus: "skipped_missing_customer",
        customerName: null,
        loiSignedDate: null,
        prospectExecutionStatus: "none",
        prospectName: null,
        icpQualification: { qualified: false, missingCriteria: [], disqualifiers: [] },
        evidenceGates: [{ id: "tier2", label: "Tier 2", pass: false, reason: "fail" }],
        evaluatorInput: {
          tier0Pass: false,
          tier1Pass: false,
          tier2Pass: false,
          roleChecklistsComplete: false,
          forbiddenClaimsInContract: false,
        },
      },
    });
    const slice = buildLaunchWizardCommercialGoClosureSlice(goClosure);
    expect(slice?.goIntegrityFailed).toBe(true);
    expect(slice?.integrityValidateCommand).toContain("validate-pilot-gono-go-integrity");
    expect(launchWizardCommercialGoClosureHref()).toContain("#launch-wizard-commercial-go-closure");
  });
});

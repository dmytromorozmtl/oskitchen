import { describe, expect, it } from "vitest";

import { buildLinearPathPermanentlyClosedUiSlice } from "@/lib/commercial/linear-path-permanently-closed-ui-era24";
import {
  buildLaunchWizardLinearPathPermanentlyClosedSlice,
  launchWizardLinearPathPermanentlyClosedHref,
} from "@/lib/launch-wizard/launch-wizard-linear-path-permanently-closed-era40";

describe("launch-wizard-linear-path-permanently-closed-era40", () => {
  it("builds slice when linear path train active with integrity flags", () => {
    const linearPath = buildLinearPathPermanentlyClosedUiSlice({
      absoluteEndActive: true,
      env: { LINEAR_PATH_PERMANENTLY_CLOSED_TERMINAL_CLOSURE_ATTESTED: "1" },
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
    const slice = buildLaunchWizardLinearPathPermanentlyClosedSlice(linearPath, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.progressLabel).toContain("doc chain");
    expect(slice!.linearPathPermanentlyClosedIntegrityFailed).toBe(true);
    expect(launchWizardLinearPathPermanentlyClosedHref()).toContain(
      "#launch-wizard-linear-path-permanently-closed",
    );
  });
});

import { describe, expect, it } from "vitest";

import { buildLinearPathPermanentlyClosedUiSlice } from "@/lib/commercial/linear-path-permanently-closed-ui-era24";
import {
  buildLaunchWizardLinearChainTerminusGuardSlice,
  launchWizardLinearChainTerminusGuardHref,
} from "@/lib/launch-wizard/launch-wizard-linear-chain-terminus-guard-era41";

describe("launch-wizard-linear-chain-terminus-guard-era41", () => {
  it("builds slice when Step 17 guard train active with integrity flags", () => {
    const linearPath = buildLinearPathPermanentlyClosedUiSlice({
      absoluteEndActive: true,
      env: { LINEAR_CHAIN_TERMINUS_GUARD_STEP17_FORBIDDEN_ATTESTED: "1" },
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
    const guard = linearPath?.step17Forbidden ?? null;
    const slice = buildLaunchWizardLinearChainTerminusGuardSlice(guard, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.progressLabel).toContain("max step");
    expect(slice!.linearChainTerminusGuardIntegrityFailed).toBe(true);
    expect(launchWizardLinearChainTerminusGuardHref()).toContain(
      "#launch-wizard-linear-chain-terminus-guard",
    );
  });
});

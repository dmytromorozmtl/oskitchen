import { describe, expect, it } from "vitest";

import { buildLinearChainTerminusGuardUiSlice } from "@/lib/commercial/linear-chain-terminus-guard-ui-era24";
import {
  buildLaunchWizardEra25CharterExitSlice,
  launchWizardEra25CharterExitHref,
} from "@/lib/launch-wizard/launch-wizard-era25-charter-exit-era42";

describe("launch-wizard-era25-charter-exit-era42", () => {
  it("builds slice when charter exit train active with integrity flags", () => {
    const guard = buildLinearChainTerminusGuardUiSlice({
      terminalClosureActive: true,
      env: { ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ATTESTED: "1" },
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
    const charterExit = guard?.era25CharterExit ?? null;
    const slice = buildLaunchWizardEra25CharterExitSlice(charterExit, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.progressLabel).toContain("outside linear");
    expect(slice!.era25CharterExitIntegrityFailed).toBe(true);
    expect(launchWizardEra25CharterExitHref()).toContain("#launch-wizard-era25-charter-exit");
  });
});

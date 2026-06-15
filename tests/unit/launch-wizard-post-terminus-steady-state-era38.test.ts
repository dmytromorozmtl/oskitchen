import { describe, expect, it } from "vitest";

import { buildPostTerminusSteadyStateUiSlice } from "@/lib/commercial/post-terminus-steady-state-ui-era24";
import {
  buildLaunchWizardPostTerminusSteadyStateSlice,
  launchWizardPostTerminusSteadyStateHref,
} from "@/lib/launch-wizard/launch-wizard-post-terminus-steady-state-era38";

describe("launch-wizard-post-terminus-steady-state-era38", () => {
  it("builds slice when steady state train active with integrity flags", () => {
    const steadyState = buildPostTerminusSteadyStateUiSlice({
      engineeringTerminusActive: true,
      env: { POST_TERMINUS_STEADY_STATE_OPERATOR_LOOP_ATTESTED: "1" },
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
    const slice = buildLaunchWizardPostTerminusSteadyStateSlice(steadyState, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.progressLabel).toContain("tracks");
    expect(slice!.postTerminusSteadyStateIntegrityFailed).toBe(true);
    expect(launchWizardPostTerminusSteadyStateHref()).toContain(
      "#launch-wizard-post-terminus-steady-state",
    );
  });
});

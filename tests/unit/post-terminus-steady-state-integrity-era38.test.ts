import { describe, expect, it } from "vitest";

import { evaluatePostTerminusSteadyStateIntegrity } from "@/lib/commercial/post-terminus-steady-state-integrity-era38";

const honestGo = {
  version: "era17-pilot-gono-go-v1" as const,
  runAt: "2026-05-28T00:00:00.000Z",
  decision: "GO" as const,
  blockers: [],
  warnings: [],
  customerExecutionStatus: "recorded" as const,
  customerName: "Acme",
  loiSignedDate: "2026-06-01",
  prospectExecutionStatus: "none" as const,
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
};

describe("post-terminus-steady-state-integrity-era38", () => {
  it("detects steady state started without honest engineering path terminus", () => {
    const result = evaluatePostTerminusSteadyStateIntegrity(process.cwd(), {
      env: { POST_TERMINUS_STEADY_STATE_OPERATOR_LOOP_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.postTerminusSteadyStateExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "steady_state_started_without_engineering_terminus"),
    ).toBe(true);
  });

  it("detects fake era charter attestation before engineering path terminus honest", () => {
    const result = evaluatePostTerminusSteadyStateIntegrity(process.cwd(), {
      env: {
        POST_TERMINUS_STEADY_STATE_OPERATOR_LOOP_ATTESTED: "1",
        POST_TERMINUS_STEADY_STATE_ERA_CHARTER_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.violations.some((row) => row.id === "fake_era_charter_attestation")).toBe(true);
  });

  it("passes when steady state env absent", () => {
    const result = evaluatePostTerminusSteadyStateIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.postTerminusSteadyStateExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});

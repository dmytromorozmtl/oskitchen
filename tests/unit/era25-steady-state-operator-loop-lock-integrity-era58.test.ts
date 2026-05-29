import { describe, expect, it } from "vitest";

import { evaluateEra25SteadyStateOperatorLoopLockIntegrity } from "@/lib/commercial/era25-steady-state-operator-loop-lock-integrity-era58";

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

describe("era25-steady-state-operator-loop-lock-integrity-era58", () => {
  it("detects steady-state lock started without honest charter lock", () => {
    const result = evaluateEra25SteadyStateOperatorLoopLockIntegrity(process.cwd(), {
      env: { ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA25_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.era25SteadyStateOperatorLoopLockExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "steady_state_lock_without_charter_lock"),
    ).toBe(true);
  });

  it("detects frozen env mutation when steady-state lock path active", () => {
    const result = evaluateEra25SteadyStateOperatorLoopLockIntegrity(process.cwd(), {
      env: {
        ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA25_ATTESTED: "1",
        ERA25_POST_REENTRANT_CHARTER_LOCK_ERA25_ATTESTED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(
      result.violations.some((row) => row.id === "era25_frozen_env_mutation_after_steady_state_lock"),
    ).toBe(true);
  });

  it("detects improvement loop rhythm mutation on steady-state path", () => {
    const result = evaluateEra25SteadyStateOperatorLoopLockIntegrity(process.cwd(), {
      env: {
        ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA25_ATTESTED: "1",
        CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CADENCE_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(
      result.violations.some((row) => row.id === "improvement_loop_rhythm_mutation_after_lock"),
    ).toBe(true);
  });

  it("passes when steady-state lock env absent", () => {
    const result = evaluateEra25SteadyStateOperatorLoopLockIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.era25SteadyStateOperatorLoopLockExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});

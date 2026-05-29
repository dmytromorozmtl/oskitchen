import { describe, expect, it } from "vitest";

import { evaluateEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrity } from "@/lib/commercial/era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity-era69";

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

describe("era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity-era69", () => {
  it("detects terminal closure witness started without rhythm permanence", () => {
    const result = evaluateEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrity(
      process.cwd(),
      {
        env: {
          ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ERA25_ATTESTED: "1",
        },
        goNoGoOverride: honestGo,
        p0ProofStatusOverride: "proof_passed",
      },
    );
    expect(result.integrityPassed).toBe(false);
    expect(result.era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessExecutionStarted).toBe(
      true,
    );
    expect(
      result.violations.some((row) => row.id === "terminal_closure_witness_without_rhythm_permanence"),
    ).toBe(true);
  });

  it("detects governance reopen env on terminal closure witness path", () => {
    const result = evaluateEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrity(
      process.cwd(),
      {
        env: {
          ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ERA25_ATTESTED: "1",
          ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ERA25_ATTESTED: "1",
        },
        goNoGoOverride: honestGo,
        p0ProofStatusOverride: "proof_passed",
      },
    );
    expect(result.governanceReopenClaimed).toBe(true);
    expect(
      result.violations.some((row) => row.id === "terminal_closure_witness_claims_governance_reopen"),
    ).toBe(true);
  });

  it("detects fake terminal closure witness attestation before prerequisites", () => {
    const result = evaluateEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrity(
      process.cwd(),
      {
        env: {
          ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ERA25_ATTESTED: "1",
          ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_ATTESTED: "1",
        },
        goNoGoOverride: honestGo,
        p0ProofStatusOverride: "awaiting_ops_credentials",
      },
    );
    expect(
      result.violations.some((row) => row.id === "fake_terminal_closure_witness_attestation"),
    ).toBe(true);
  });

  it("passes when terminal closure witness env absent", () => {
    const result = evaluateEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrity(
      process.cwd(),
      { env: {}, goNoGoOverride: honestGo },
    );
    expect(result.era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessExecutionStarted).toBe(
      false,
    );
    expect(result.integrityPassed).toBe(true);
  });
});

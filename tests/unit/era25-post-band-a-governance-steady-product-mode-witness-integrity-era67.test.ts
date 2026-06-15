import { describe, expect, it } from "vitest";

import { evaluateEra25PostBandAGovernanceSteadyProductModeWitnessIntegrity } from "@/lib/commercial/era25-post-band-a-governance-steady-product-mode-witness-integrity-era67";

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

describe("era25-post-band-a-governance-steady-product-mode-witness-integrity-era67", () => {
  it("detects steady product mode witness started without capstone witness", () => {
    const result = evaluateEra25PostBandAGovernanceSteadyProductModeWitnessIntegrity(process.cwd(), {
      env: { ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA25_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.era25PostBandAGovernanceSteadyProductModeWitnessExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "steady_product_mode_witness_without_capstone"),
    ).toBe(true);
  });

  it("detects governance reopen env on steady product mode witness path", () => {
    const result = evaluateEra25PostBandAGovernanceSteadyProductModeWitnessIntegrity(process.cwd(), {
      env: {
        ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA25_ATTESTED: "1",
        ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA25_ATTESTED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
    });
    expect(result.governanceReopenClaimed).toBe(true);
    expect(
      result.violations.some((row) => row.id === "steady_product_mode_witness_claims_governance_reopen"),
    ).toBe(true);
  });

  it("detects fake steady product mode witness attestation before prerequisites", () => {
    const result = evaluateEra25PostBandAGovernanceSteadyProductModeWitnessIntegrity(process.cwd(), {
      env: {
        ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA25_ATTESTED: "1",
        ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_ATTESTED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "awaiting_ops_credentials",
    });
    expect(
      result.violations.some((row) => row.id === "fake_steady_product_mode_witness_attestation"),
    ).toBe(true);
  });

  it("passes when steady product mode witness env absent", () => {
    const result = evaluateEra25PostBandAGovernanceSteadyProductModeWitnessIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.era25PostBandAGovernanceSteadyProductModeWitnessExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});

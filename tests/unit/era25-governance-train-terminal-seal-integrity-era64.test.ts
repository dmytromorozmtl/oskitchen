import { describe, expect, it } from "vitest";

import { evaluateEra25GovernanceTrainTerminalSealIntegrity } from "@/lib/commercial/era25-governance-train-terminal-seal-integrity-era64";

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

describe("era25-governance-train-terminal-seal-integrity-era64", () => {
  it("detects seal started without steady ops witness active", () => {
    const result = evaluateEra25GovernanceTrainTerminalSealIntegrity(process.cwd(), {
      env: { ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA25_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.era25GovernanceTrainTerminalSealExecutionStarted).toBe(true);
    expect(result.violations.some((row) => row.id === "seal_without_steady_witness")).toBe(true);
  });

  it("detects governance reopen env on seal path", () => {
    const result = evaluateEra25GovernanceTrainTerminalSealIntegrity(process.cwd(), {
      env: {
        ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA25_ATTESTED: "1",
        ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ERA25_ATTESTED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
    });
    expect(result.governanceReopenClaimed).toBe(true);
    expect(result.violations.some((row) => row.id === "seal_claims_governance_reopen")).toBe(
      true,
    );
  });

  it("detects fake seal attestation before prerequisites", () => {
    const result = evaluateEra25GovernanceTrainTerminalSealIntegrity(process.cwd(), {
      env: {
        ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA25_ATTESTED: "1",
        ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_ATTESTED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "awaiting_ops_credentials",
    });
    expect(result.violations.some((row) => row.id === "fake_seal_attestation")).toBe(true);
  });

  it("passes when seal env absent", () => {
    const result = evaluateEra25GovernanceTrainTerminalSealIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.era25GovernanceTrainTerminalSealExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});

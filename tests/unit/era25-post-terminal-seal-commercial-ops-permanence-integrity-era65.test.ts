import { describe, expect, it } from "vitest";

import { evaluateEra25PostTerminalSealCommercialOpsPermanenceIntegrity } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-integrity-era65";

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

describe("era25-post-terminal-seal-commercial-ops-permanence-integrity-era65", () => {
  it("detects permanence started without terminal seal", () => {
    const result = evaluateEra25PostTerminalSealCommercialOpsPermanenceIntegrity(process.cwd(), {
      env: { ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA25_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.era25PostTerminalSealCommercialOpsPermanenceExecutionStarted).toBe(true);
    expect(result.violations.some((row) => row.id === "permanence_without_terminal_seal")).toBe(
      true,
    );
  });

  it("detects governance reopen env on permanence path", () => {
    const result = evaluateEra25PostTerminalSealCommercialOpsPermanenceIntegrity(process.cwd(), {
      env: {
        ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA25_ATTESTED: "1",
        ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA25_ATTESTED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
    });
    expect(result.governanceReopenClaimed).toBe(true);
    expect(
      result.violations.some((row) => row.id === "permanence_claims_governance_reopen"),
    ).toBe(true);
  });

  it("detects fake permanence attestation before prerequisites", () => {
    const result = evaluateEra25PostTerminalSealCommercialOpsPermanenceIntegrity(process.cwd(), {
      env: {
        ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA25_ATTESTED: "1",
        ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_ATTESTED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "awaiting_ops_credentials",
    });
    expect(result.violations.some((row) => row.id === "fake_permanence_attestation")).toBe(true);
  });

  it("passes when permanence env absent", () => {
    const result = evaluateEra25PostTerminalSealCommercialOpsPermanenceIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.era25PostTerminalSealCommercialOpsPermanenceExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});

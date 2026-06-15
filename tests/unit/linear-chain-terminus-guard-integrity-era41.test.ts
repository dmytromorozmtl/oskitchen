import { describe, expect, it } from "vitest";

import { evaluateLinearChainTerminusGuardIntegrity } from "@/lib/commercial/linear-chain-terminus-guard-integrity-era41";

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

describe("linear-chain-terminus-guard-integrity-era41", () => {
  it("detects terminus guard started without honest linear path closed", () => {
    const result = evaluateLinearChainTerminusGuardIntegrity(process.cwd(), {
      env: { LINEAR_CHAIN_TERMINUS_GUARD_STEP17_FORBIDDEN_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.linearChainTerminusGuardExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "terminus_guard_started_without_linear_path_closed"),
    ).toBe(true);
  });

  it("detects fake terminus guard report attestation before linear path honest", () => {
    const result = evaluateLinearChainTerminusGuardIntegrity(process.cwd(), {
      env: {
        LINEAR_CHAIN_TERMINUS_GUARD_STEP17_FORBIDDEN_ATTESTED: "1",
        LINEAR_CHAIN_TERMINUS_GUARD_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.violations.some((row) => row.id === "fake_terminus_guard_report_attestation")).toBe(
      true,
    );
  });

  it("passes when terminus guard env absent", () => {
    const result = evaluateLinearChainTerminusGuardIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.linearChainTerminusGuardExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});

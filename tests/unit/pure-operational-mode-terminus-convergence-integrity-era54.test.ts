import { describe, expect, it } from "vitest";

import { evaluatePureOperationalModeTerminusConvergenceIntegrity } from "@/lib/commercial/pure-operational-mode-terminus-convergence-integrity-era54";

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

describe("pure-operational-mode-terminus-convergence-integrity-era54", () => {
  it("detects pure ops started without honest sustained ops convergence ready", () => {
    const result = evaluatePureOperationalModeTerminusConvergenceIntegrity(process.cwd(), {
      env: { PURE_OPERATIONAL_MODE_TERMINUS_ERA25_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.pureOperationalModeTerminusConvergenceExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "pure_ops_started_without_sustained_ops_convergence_ready"),
    ).toBe(true);
  });

  it("detects fake pure ops report attestation before sustained ops honest", () => {
    const result = evaluatePureOperationalModeTerminusConvergenceIntegrity(process.cwd(), {
      env: {
        PURE_OPERATIONAL_MODE_TERMINUS_ERA25_ATTESTED: "1",
        PURE_OPERATIONAL_MODE_TERMINUS_ERA25_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(
      result.violations.some((row) => row.id === "fake_pure_ops_convergence_report_attestation"),
    ).toBe(true);
  });

  it("passes when pure ops env absent", () => {
    const result = evaluatePureOperationalModeTerminusConvergenceIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.pureOperationalModeTerminusConvergenceExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});

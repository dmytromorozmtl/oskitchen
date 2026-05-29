import { describe, expect, it } from "vitest";

import { evaluatePaidPilotGoConvergenceIntegrity } from "@/lib/commercial/paid-pilot-go-convergence-integrity-era47";

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

describe("paid-pilot-go-convergence-integrity-era47", () => {
  it("detects convergence started without honest breakthrough ready", () => {
    const result = evaluatePaidPilotGoConvergenceIntegrity(process.cwd(), {
      env: { PAID_PILOT_GO_CONVERGENCE_ERA25_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.paidPilotGoConvergenceExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "convergence_started_without_breakthrough_ready"),
    ).toBe(true);
  });

  it("detects fake convergence report attestation before breakthrough honest", () => {
    const result = evaluatePaidPilotGoConvergenceIntegrity(process.cwd(), {
      env: {
        PAID_PILOT_GO_CONVERGENCE_ERA25_ATTESTED: "1",
        PAID_PILOT_GO_CONVERGENCE_ERA25_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.violations.some((row) => row.id === "fake_convergence_report_attestation")).toBe(
      true,
    );
  });

  it("passes when convergence env absent", () => {
    const result = evaluatePaidPilotGoConvergenceIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.paidPilotGoConvergenceExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});

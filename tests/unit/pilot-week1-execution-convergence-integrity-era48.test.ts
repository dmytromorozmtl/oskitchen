import { describe, expect, it } from "vitest";

import { evaluatePilotWeek1ExecutionConvergenceIntegrity } from "@/lib/commercial/pilot-week1-execution-convergence-integrity-era48";

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

describe("pilot-week1-execution-convergence-integrity-era48", () => {
  it("detects week 1 started without honest GO convergence ready", () => {
    const result = evaluatePilotWeek1ExecutionConvergenceIntegrity(process.cwd(), {
      env: { PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.pilotWeek1ExecutionConvergenceExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "week1_started_without_go_convergence_ready"),
    ).toBe(true);
  });

  it("detects fake week 1 report attestation before GO convergence honest", () => {
    const result = evaluatePilotWeek1ExecutionConvergenceIntegrity(process.cwd(), {
      env: {
        PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_ATTESTED: "1",
        PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.violations.some((row) => row.id === "fake_week1_convergence_report_attestation")).toBe(
      true,
    );
  });

  it("passes when week 1 env absent", () => {
    const result = evaluatePilotWeek1ExecutionConvergenceIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.pilotWeek1ExecutionConvergenceExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});

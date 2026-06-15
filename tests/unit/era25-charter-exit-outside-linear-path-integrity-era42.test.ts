import { describe, expect, it } from "vitest";

import { evaluateEra25CharterExitOutsideLinearPathIntegrity } from "@/lib/commercial/era25-charter-exit-outside-linear-path-integrity-era42";

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

describe("era25-charter-exit-outside-linear-path-integrity-era42", () => {
  it("detects charter exit started without honest Step 17 guard", () => {
    const result = evaluateEra25CharterExitOutsideLinearPathIntegrity(process.cwd(), {
      env: { ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.era25CharterExitExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "charter_exit_started_without_step17_guard"),
    ).toBe(true);
  });

  it("detects fake charter exit report attestation before Step 17 guard honest", () => {
    const result = evaluateEra25CharterExitOutsideLinearPathIntegrity(process.cwd(), {
      env: {
        ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ATTESTED: "1",
        ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(
      result.violations.some((row) => row.id === "fake_charter_exit_report_attestation"),
    ).toBe(true);
  });

  it("passes when charter exit env absent", () => {
    const result = evaluateEra25CharterExitOutsideLinearPathIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.era25CharterExitExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});

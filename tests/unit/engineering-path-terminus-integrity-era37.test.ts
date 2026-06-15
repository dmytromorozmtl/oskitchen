import { describe, expect, it } from "vitest";

import { evaluateEngineeringPathTerminusIntegrity } from "@/lib/commercial/engineering-path-terminus-integrity-era37";

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

describe("engineering-path-terminus-integrity-era37", () => {
  it("detects terminus started without honest maintenance mode", () => {
    const result = evaluateEngineeringPathTerminusIntegrity(process.cwd(), {
      env: { ENGINEERING_PATH_TERMINUS_MASTER_PATH_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.engineeringPathTerminusExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "terminus_started_without_maintenance_mode"),
    ).toBe(true);
  });

  it("detects fake status report attestation before maintenance mode honest", () => {
    const result = evaluateEngineeringPathTerminusIntegrity(process.cwd(), {
      env: {
        ENGINEERING_PATH_TERMINUS_MASTER_PATH_ATTESTED: "1",
        ENGINEERING_PATH_TERMINUS_STATUS_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.violations.some((row) => row.id === "fake_status_report_attestation")).toBe(
      true,
    );
  });

  it("passes when terminus env absent", () => {
    const result = evaluateEngineeringPathTerminusIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.engineeringPathTerminusExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});

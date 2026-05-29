import { describe, expect, it } from "vitest";

import { evaluateCommercialPilotPathAbsoluteEndIntegrity } from "@/lib/commercial/commercial-pilot-path-absolute-end-integrity-era39";

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

describe("commercial-pilot-path-absolute-end-integrity-era39", () => {
  it("detects absolute end started without honest post-terminus steady state", () => {
    const result = evaluateCommercialPilotPathAbsoluteEndIntegrity(process.cwd(), {
      env: { COMMERCIAL_PILOT_PATH_ABSOLUTE_END_PATH_CLOSURE_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.commercialPilotPathAbsoluteEndExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "absolute_end_started_without_steady_state"),
    ).toBe(true);
  });

  it("detects fake absolute end report attestation before steady state honest", () => {
    const result = evaluateCommercialPilotPathAbsoluteEndIntegrity(process.cwd(), {
      env: {
        COMMERCIAL_PILOT_PATH_ABSOLUTE_END_PATH_CLOSURE_ATTESTED: "1",
        COMMERCIAL_PILOT_PATH_ABSOLUTE_END_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.violations.some((row) => row.id === "fake_absolute_end_report_attestation")).toBe(
      true,
    );
  });

  it("passes when absolute end env absent", () => {
    const result = evaluateCommercialPilotPathAbsoluteEndIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.commercialPilotPathAbsoluteEndExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});

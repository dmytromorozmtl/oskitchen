import { describe, expect, it } from "vitest";

import { evaluateEra25FirstCharterSliceReadinessIntegrity } from "@/lib/commercial/era25-first-charter-slice-readiness-integrity-era43";

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

describe("era25-first-charter-slice-readiness-integrity-era43", () => {
  it("detects first slice started without honest charter exit", () => {
    const result = evaluateEra25FirstCharterSliceReadinessIntegrity(process.cwd(), {
      env: { ERA25_FIRST_CHARTER_SLICE_READINESS_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.era25FirstCharterSliceExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "first_slice_started_without_charter_exit"),
    ).toBe(true);
  });

  it("detects fake first slice report attestation before charter exit honest", () => {
    const result = evaluateEra25FirstCharterSliceReadinessIntegrity(process.cwd(), {
      env: {
        ERA25_FIRST_CHARTER_SLICE_READINESS_ATTESTED: "1",
        ERA25_FIRST_CHARTER_SLICE_READINESS_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.violations.some((row) => row.id === "fake_first_slice_report_attestation")).toBe(
      true,
    );
  });

  it("passes when first slice env absent", () => {
    const result = evaluateEra25FirstCharterSliceReadinessIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.era25FirstCharterSliceExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});

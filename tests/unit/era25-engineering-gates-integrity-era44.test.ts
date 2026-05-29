import { describe, expect, it } from "vitest";

import { evaluateEra25EngineeringGatesIntegrity } from "@/lib/commercial/era25-engineering-gates-integrity-era44";

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

describe("era25-engineering-gates-integrity-era44", () => {
  it("detects engineering gates started without honest first charter slice", () => {
    const result = evaluateEra25EngineeringGatesIntegrity(process.cwd(), {
      env: { ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.era25EngineeringGatesExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "engineering_gates_started_without_first_slice_ready"),
    ).toBe(true);
  });

  it("detects fake engineering gates report attestation before slice honest", () => {
    const result = evaluateEra25EngineeringGatesIntegrity(process.cwd(), {
      env: {
        ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ATTESTED: "1",
        ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.violations.some((row) => row.id === "fake_engineering_gates_report_attestation")).toBe(
      true,
    );
  });

  it("passes when engineering gates env absent", () => {
    const result = evaluateEra25EngineeringGatesIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.era25EngineeringGatesExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});

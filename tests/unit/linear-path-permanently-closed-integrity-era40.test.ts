import { describe, expect, it } from "vitest";

import { evaluateLinearPathPermanentlyClosedIntegrity } from "@/lib/commercial/linear-path-permanently-closed-integrity-era40";

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

describe("linear-path-permanently-closed-integrity-era40", () => {
  it("detects linear path started without honest absolute end", () => {
    const result = evaluateLinearPathPermanentlyClosedIntegrity(process.cwd(), {
      env: { LINEAR_PATH_PERMANENTLY_CLOSED_TERMINAL_CLOSURE_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.linearPathPermanentlyClosedExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "linear_path_closed_started_without_absolute_end"),
    ).toBe(true);
  });

  it("detects fake linear path report attestation before absolute end honest", () => {
    const result = evaluateLinearPathPermanentlyClosedIntegrity(process.cwd(), {
      env: {
        LINEAR_PATH_PERMANENTLY_CLOSED_TERMINAL_CLOSURE_ATTESTED: "1",
        LINEAR_PATH_PERMANENTLY_CLOSED_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.violations.some((row) => row.id === "fake_linear_path_closed_report_attestation")).toBe(
      true,
    );
  });

  it("passes when linear path env absent", () => {
    const result = evaluateLinearPathPermanentlyClosedIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.linearPathPermanentlyClosedExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});

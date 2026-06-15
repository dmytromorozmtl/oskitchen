import { describe, expect, it } from "vitest";

import { evaluateEra25PostReentrantCharterLockIntegrity } from "@/lib/commercial/era25-post-re-entrant-charter-lock-integrity-era57";

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

describe("era25-post-re-entrant-charter-lock-integrity-era57", () => {
  it("detects charter lock started without honest re-entrant", () => {
    const result = evaluateEra25PostReentrantCharterLockIntegrity(process.cwd(), {
      env: { ERA25_POST_REENTRANT_CHARTER_LOCK_ERA25_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.era25PostReentrantCharterLockExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "charter_lock_without_reentrant_honest"),
    ).toBe(true);
  });

  it("detects frozen env mutation when charter lock path active", () => {
    const result = evaluateEra25PostReentrantCharterLockIntegrity(process.cwd(), {
      env: {
        ERA25_POST_REENTRANT_CHARTER_LOCK_ERA25_ATTESTED: "1",
        PAID_PILOT_GO_CONVERGENCE_ERA25_ATTESTED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(
      result.violations.some((row) => row.id === "era25_linear_env_mutation_after_lock"),
    ).toBe(true);
  });

  it("detects fake charter lock report attestation before re-entrant honest", () => {
    const result = evaluateEra25PostReentrantCharterLockIntegrity(process.cwd(), {
      env: {
        ERA25_POST_REENTRANT_CHARTER_LOCK_ERA25_ATTESTED: "1",
        ERA25_POST_REENTRANT_CHARTER_LOCK_ERA25_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.violations.some((row) => row.id === "fake_charter_lock_report_attestation")).toBe(
      true,
    );
  });

  it("passes when charter lock env absent", () => {
    const result = evaluateEra25PostReentrantCharterLockIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.era25PostReentrantCharterLockExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});

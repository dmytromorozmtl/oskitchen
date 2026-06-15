import { describe, expect, it } from "vitest";

import { evaluateMonth2MarketReadinessConvergenceIntegrity } from "@/lib/commercial/month2-market-readiness-convergence-integrity-era49";

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

describe("month2-market-readiness-convergence-integrity-era49", () => {
  it("detects month 2 started without honest week 1 convergence ready", () => {
    const result = evaluateMonth2MarketReadinessConvergenceIntegrity(process.cwd(), {
      env: { MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.month2MarketReadinessConvergenceExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "month2_started_without_week1_convergence_ready"),
    ).toBe(true);
  });

  it("detects fake month 2 report attestation before week 1 honest", () => {
    const result = evaluateMonth2MarketReadinessConvergenceIntegrity(process.cwd(), {
      env: {
        MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_ATTESTED: "1",
        MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(
      result.violations.some((row) => row.id === "fake_month2_convergence_report_attestation"),
    ).toBe(true);
  });

  it("passes when month 2 env absent", () => {
    const result = evaluateMonth2MarketReadinessConvergenceIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.month2MarketReadinessConvergenceExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});

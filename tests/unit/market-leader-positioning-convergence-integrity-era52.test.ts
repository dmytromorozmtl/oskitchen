import { describe, expect, it } from "vitest";

import { evaluateMarketLeaderPositioningConvergenceIntegrity } from "@/lib/commercial/market-leader-positioning-convergence-integrity-era52";

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

describe("market-leader-positioning-convergence-integrity-era52", () => {
  it("detects market leader started without honest Series A convergence ready", () => {
    const result = evaluateMarketLeaderPositioningConvergenceIntegrity(process.cwd(), {
      env: { MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.marketLeaderPositioningConvergenceExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "market_leader_started_without_series_a_convergence_ready"),
    ).toBe(true);
  });

  it("detects fake market leader report attestation before Series A honest", () => {
    const result = evaluateMarketLeaderPositioningConvergenceIntegrity(process.cwd(), {
      env: {
        MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_ATTESTED: "1",
        MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_REPORT_REVIEWED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(
      result.violations.some((row) => row.id === "fake_market_leader_convergence_report_attestation"),
    ).toBe(true);
  });

  it("passes when market leader env absent", () => {
    const result = evaluateMarketLeaderPositioningConvergenceIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.marketLeaderPositioningConvergenceExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});

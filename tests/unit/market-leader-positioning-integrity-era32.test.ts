import { describe, expect, it } from "vitest";

import { evaluateMarketLeaderPositioningIntegrity } from "@/lib/commercial/market-leader-positioning-integrity-era32";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import { recomputeInvestorNarrativeProofStatusFromSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { recomputePilotRollbackProofStatusFromSummary } from "@/lib/commercial/pilot-rollback-drill-summary";

describe("market-leader-positioning-integrity-era32", () => {
  it("detects market leader started without honest Series A", () => {
    const result = evaluateMarketLeaderPositioningIntegrity(process.cwd(), {
      env: { MARKET_LEADER_MOAT_DECK_REVIEWED: "1" },
      goNoGoOverride: {
        version: "era17-pilot-gono-go-v1",
        runAt: "2026-05-28T00:00:00.000Z",
        decision: "GO",
        blockers: [],
        warnings: [],
        customerExecutionStatus: "recorded",
        customerName: "Acme",
        loiSignedDate: "2026-06-01",
        prospectExecutionStatus: "none",
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
      },
      p0ProofStatus: "proof_passed",
      tier2ProofStatus: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.marketLeaderExecutionStarted).toBe(true);
    expect(result.violations.some((row) => row.id === "market_leader_started_without_series_a")).toBe(
      true,
    );
  });

  it("detects fake investor PASS for analyst kit pillar", () => {
    const investor: InvestorNarrativeOnepagerSummary = {
      version: "era17-investor-narrative-onepager-v2-v1",
      runAt: "2026-05-28T00:00:00.000Z",
      commitSha: "abc",
      overall: "PASSED",
      narrativeProofStatus: "proof_ready_with_metrics",
      pilotMetricsArtifactLoaded: false,
      pilotMetricsOverall: "FAILED",
      pilotMetricsBaselineProofStatus: "proof_missing",
      pilotMetricsCapturedCount: 0,
      certPassed: false,
    };
    expect(recomputeInvestorNarrativeProofStatusFromSummary(investor)).not.toBe(
      "proof_ready_with_metrics",
    );

    const result = evaluateMarketLeaderPositioningIntegrity(process.cwd(), {
      env: { MARKET_LEADER_ANALYST_KIT_PUBLISHED: "1" },
      investorOnepagerOverride: investor,
      goNoGoOverride: null,
    });
    expect(result.violations.some((row) => row.id === "fake_investor_pass")).toBe(true);
  });

  it("detects fake rollback PASS for moat deck pillar", () => {
    const rollback: PilotRollbackDrillSummary = {
      version: "era17-pilot-rollback-drill-v1",
      policyId: "era17-pilot-rollback-drill-v1",
      runAt: "2026-05-28T00:00:00.000Z",
      drillMode: "tabletop",
      rollbackProofStatus: "proof_passed",
      stagingUrl: null,
      operatorEmail: null,
      rollbackReason: null,
      commitSha: null,
      retrospective: { outcome: null, lessons: null, recorded: false },
      steps: [
        {
          order: 1,
          action: "step",
          owner: "ops",
          status: "SKIPPED",
          reason: "missing",
        },
      ],
      passedStepCount: 0,
      totalSteps: 1,
    };
    expect(recomputePilotRollbackProofStatusFromSummary(rollback)).not.toBe("proof_passed");

    const result = evaluateMarketLeaderPositioningIntegrity(process.cwd(), {
      env: { MARKET_LEADER_MOAT_DECK_REVIEWED: "1" },
      rollbackDrillOverride: rollback,
      goNoGoOverride: null,
    });
    expect(result.violations.some((row) => row.id === "fake_rollback_pass")).toBe(true);
  });
});

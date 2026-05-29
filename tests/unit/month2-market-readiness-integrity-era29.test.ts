import { describe, expect, it } from "vitest";

import { evaluateMonth2MarketReadinessIntegrity } from "@/lib/commercial/month2-market-readiness-integrity-era29";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import { recomputeInvestorNarrativeProofStatusFromSummary } from "@/lib/commercial/investor-narrative-onepager-summary";

describe("month2-market-readiness-integrity-era29", () => {
  it("detects Month 2 started without honest Week 1", () => {
    const result = evaluateMonth2MarketReadinessIntegrity(process.cwd(), {
      env: { MONTH2_INVESTOR_FOUNDER_SIGNOFF: "1" },
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
    expect(result.month2ExecutionStarted).toBe(true);
    expect(result.violations.some((row) => row.id === "month2_started_without_week1")).toBe(true);
  });

  it("detects fake investor PASS", () => {
    const investor: InvestorNarrativeOnepagerSummary = {
      version: "era17-investor-narrative-onepager-v2-v1",
      runAt: "2026-05-28T00:00:00.000Z",
      commitSha: "abc",
      overall: "PASSED",
      narrativeProofStatus: "proof_ready_with_metrics",
      pilotMetricsArtifactLoaded: false,
      pilotMetricsOverall: null,
      pilotMetricsBaselineProofStatus: null,
      pilotMetricsCapturedCount: null,
      certPassed: true,
    };
    expect(recomputeInvestorNarrativeProofStatusFromSummary(investor)).toBe(
      "proof_skipped_missing_pilot_metrics",
    );

    const result = evaluateMonth2MarketReadinessIntegrity(process.cwd(), {
      investorOnepagerOverride: investor,
      goNoGoOverride: null,
    });
    expect(result.violations.some((row) => row.id === "fake_investor_pass")).toBe(true);
  });
});

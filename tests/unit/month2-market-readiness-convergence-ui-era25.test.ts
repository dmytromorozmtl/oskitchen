import { describe, expect, it } from "vitest";

import {
  buildMonth2MarketReadinessConvergenceEra25UiSlice,
  formatMonth2MarketReadinessConvergenceEra25Label,
} from "@/lib/commercial/month2-market-readiness-convergence-ui-era25";

describe("month2-market-readiness-convergence-ui-era25", () => {
  it("returns null when week 1 convergence not visible", () => {
    expect(
      buildMonth2MarketReadinessConvergenceEra25UiSlice({ week1ConvergenceVisible: false }),
    ).toBeNull();
  });

  it("builds slice when week 1 convergence visible", () => {
    const slice = buildMonth2MarketReadinessConvergenceEra25UiSlice({
      week1ConvergenceVisible: true,
      env: {},
    });
    expect(slice).not.toBeNull();
    expect(slice?.outsideLinearCatalog).toBe(true);
    expect(slice?.month2MarketReadinessConvergenceEra25Milestone).toBe(
      "week1_convergence_regression_blocked",
    );
    expect(slice?.postWeek1ConvergenceOrchestratorCommand).toContain(
      "run-month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25",
    );
  });

  it("flags integrity fail when month 2 attested without week 1 ready", () => {
    const slice = buildMonth2MarketReadinessConvergenceEra25UiSlice({
      week1ConvergenceVisible: true,
      env: { MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_ATTESTED: "1" },
      goNoGoSummary: {
        version: "era17-pilot-gono-go-v1",
        runAt: new Date().toISOString(),
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
    expect(slice?.month2MarketReadinessConvergenceIntegrityPassed).toBe(false);
  });

  it("formats convergence label", () => {
    const slice = buildMonth2MarketReadinessConvergenceEra25UiSlice({
      week1ConvergenceVisible: true,
      env: {},
    });
    expect(slice).not.toBeNull();
    if (!slice) return;
    expect(formatMonth2MarketReadinessConvergenceEra25Label(slice)).toContain("month 2");
    expect(formatMonth2MarketReadinessConvergenceEra25Label(slice)).toContain("BLOCKED");
  });
});

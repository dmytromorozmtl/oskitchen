import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingMonth2MarketReadinessAction,
  MONTH2_MARKET_READINESS_BRIEFING_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-month2-market-readiness-era21";
import { buildMonth2MarketReadinessUiSlice } from "@/lib/commercial/month2-market-readiness-ui-era21";

describe("owner-daily-briefing-month2-market-readiness-era21", () => {
  it("builds ranked action with priority 4 when Month 2 active", () => {
    const slice = buildMonth2MarketReadinessUiSlice({
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
          tier3Pass: false,
          roleChecklistsComplete: true,
          forbiddenClaimsInContract: true,
          icpQualified: true,
          stagingUrl: "https://x.example.com",
          commitSha: "abc",
        },
      },
      metricsBaseline: {
        version: "era17-pilot-metrics-baseline-v1",
        policyId: "era17-pilot-metrics-baseline-v1",
        runAt: new Date().toISOString(),
        overall: "PASSED",
        baselineProofStatus: "proof_captured",
        pilotWeek: 1,
        customerRef: "Acme",
        capturedAt: new Date().toISOString(),
        metrics: [],
        capturedCount: 6,
        missingCount: 0,
      },
      caseStudyDraft: {
        version: "era17-pilot-case-study-draft-v1",
        runAt: new Date().toISOString(),
        commitSha: "abc",
        overall: "PASSED",
        caseStudyProofStatus: "internal_draft_ready",
        publishProofStatus: "proof_skipped_awaiting_customer_approval",
        pilotMetricsArtifactLoaded: true,
        pilotMetricsOverall: "PASSED",
        customerApprovalStatus: null,
        certPassed: true,
      },
      env: {
        PILOT_WEEK1_TTV_HOURS: "6",
        PILOT_WEEK1_FIRST_ORDER_ID: "ord_123",
        PILOT_WEEK1_INTEGRATION_HEALTH_REVIEWED: "1",
        PILOT_WEEK1_POS_CLOSEOUT_STATUS: "pass",
        PILOT_WEEK1_REPORTS_WEEKLY_EXPORT: "1",
      },
    });
    const action = buildOwnerDailyBriefingMonth2MarketReadinessAction(slice);
    expect(action?.id).toBe("month2-market-readiness");
    expect(action?.priority).toBe(MONTH2_MARKET_READINESS_BRIEFING_ACTION_PRIORITY);
    expect(action?.title).toContain("Month 2");
  });
});

import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingScaleReadinessAction,
  SCALE_READINESS_BRIEFING_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-scale-readiness-era21";
import { buildScaleReadinessUiSlice } from "@/lib/commercial/scale-readiness-ui-era21";

describe("owner-daily-briefing-scale-readiness-era21", () => {
  it("builds ranked action with priority 5 when scale readiness active", () => {
    const slice = buildScaleReadinessUiSlice({
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
        publishProofStatus: "proof_ready_for_publish",
        pilotMetricsArtifactLoaded: true,
        pilotMetricsOverall: "PASSED",
        customerApprovalStatus: "signed",
        certPassed: true,
      },
      investorOnepager: {
        version: "era17-investor-narrative-onepager-v2-v1",
        runAt: new Date().toISOString(),
        commitSha: "abc",
        overall: "PASSED",
        narrativeProofStatus: "proof_ready_with_metrics",
        pilotMetricsArtifactLoaded: true,
        pilotMetricsOverall: "PASSED",
        pilotMetricsBaselineProofStatus: "proof_captured",
        pilotMetricsCapturedCount: 6,
        certPassed: true,
      },
      env: {
        PILOT_WEEK1_TTV_HOURS: "6",
        PILOT_WEEK1_FIRST_ORDER_ID: "ord_123",
        PILOT_WEEK1_INTEGRATION_HEALTH_REVIEWED: "1",
        PILOT_WEEK1_POS_CLOSEOUT_STATUS: "pass",
        PILOT_WEEK1_REPORTS_WEEKLY_EXPORT: "1",
        MONTH2_INVESTOR_FOUNDER_SIGNOFF: "1",
        MONTH2_GTM_GHOST_KITCHEN_LANDING_REVIEWED: "1",
        MONTH2_GTM_MEAL_PREP_LANDING_REVIEWED: "1",
        PILOT_CASE_STUDY_CUSTOMER_APPROVAL: "signed",
      },
    });
    const action = buildOwnerDailyBriefingScaleReadinessAction(slice);
    expect(action?.id).toBe("scale-readiness");
    expect(action?.priority).toBe(SCALE_READINESS_BRIEFING_ACTION_PRIORITY);
    expect(action?.title).toContain("Scale readiness");
  });
});

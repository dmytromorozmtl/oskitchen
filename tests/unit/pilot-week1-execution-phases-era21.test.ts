import { describe, expect, it } from "vitest";

import {
  buildPilotWeek1ExecutionPhaseStatuses,
  resolveNextIncompletePilotWeek1ExecutionPhase,
  resolvePilotWeek1ExecutionComplete,
  resolvePilotWeek1ExecutionPrerequisites,
} from "@/lib/commercial/pilot-week1-execution-phases-era21";

describe("pilot-week1-execution-phases-era21", () => {
  it("requires GO decision for prerequisites", () => {
    expect(
      resolvePilotWeek1ExecutionPrerequisites({ goDecision: "NO-GO" }).prerequisitesComplete,
    ).toBe(false);
    expect(
      resolvePilotWeek1ExecutionPrerequisites({ goDecision: "GO" }).prerequisitesComplete,
    ).toBe(true);
  });

  it("builds five day phases after GO", () => {
    const phases = buildPilotWeek1ExecutionPhaseStatuses({
      prerequisites: resolvePilotWeek1ExecutionPrerequisites({ goDecision: "GO" }),
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
      metricsBaseline: null,
      caseStudyDraft: null,
      env: {},
    });
    expect(phases).toHaveLength(5);
    expect(resolveNextIncompletePilotWeek1ExecutionPhase(phases)?.id).toBe("day1_ttv_onboarding");
    expect(resolvePilotWeek1ExecutionComplete(phases)).toBe(false);
  });

  it("marks week1 complete when all phases and day5 artifacts pass", () => {
    const phases = buildPilotWeek1ExecutionPhaseStatuses({
      prerequisites: resolvePilotWeek1ExecutionPrerequisites({ goDecision: "GO" }),
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
    expect(resolvePilotWeek1ExecutionComplete(phases)).toBe(true);
  });
});

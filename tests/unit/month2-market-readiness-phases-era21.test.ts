import { describe, expect, it } from "vitest";

import {
  buildMonth2MarketReadinessPhaseStatuses,
  resolveMonth2MarketReadinessComplete,
  resolveMonth2MarketReadinessPrerequisites,
  resolveNextIncompleteMonth2MarketReadinessPhase,
  resolveWeek1CompleteForMonth2,
} from "@/lib/commercial/month2-market-readiness-phases-era21";

const goSummary = {
  version: "era17-pilot-gono-go-v1" as const,
  runAt: new Date().toISOString(),
  decision: "GO" as const,
  blockers: [] as string[],
  warnings: [] as string[],
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
    tier3Pass: false,
    roleChecklistsComplete: true,
    forbiddenClaimsInContract: true,
    icpQualified: true,
    stagingUrl: "https://x.example.com",
    commitSha: "abc",
  },
};

const week1Env = {
  PILOT_WEEK1_TTV_HOURS: "6",
  PILOT_WEEK1_FIRST_ORDER_ID: "ord_123",
  PILOT_WEEK1_INTEGRATION_HEALTH_REVIEWED: "1",
  PILOT_WEEK1_POS_CLOSEOUT_STATUS: "pass",
  PILOT_WEEK1_REPORTS_WEEKLY_EXPORT: "1",
};

describe("month2-market-readiness-phases-era21", () => {
  it("requires GO and Week 1 complete for prerequisites", () => {
    expect(
      resolveMonth2MarketReadinessPrerequisites({
        goDecision: "GO",
        week1Complete: false,
      }).prerequisitesComplete,
    ).toBe(false);
    expect(
      resolveMonth2MarketReadinessPrerequisites({
        goDecision: "GO",
        week1Complete: true,
      }).prerequisitesComplete,
    ).toBe(true);
  });

  it("detects Week 1 complete from env and artifacts", () => {
    const metrics = {
      version: "era17-pilot-metrics-baseline-v1" as const,
      policyId: "era17-pilot-metrics-baseline-v1" as const,
      runAt: new Date().toISOString(),
      overall: "PASSED" as const,
      baselineProofStatus: "proof_captured" as const,
      pilotWeek: 1,
      customerRef: "Acme",
      capturedAt: new Date().toISOString(),
      metrics: [],
      capturedCount: 6,
      missingCount: 0,
    };
    const caseStudy = {
      version: "era17-pilot-case-study-draft-v1" as const,
      runAt: new Date().toISOString(),
      commitSha: "abc",
      overall: "PASSED" as const,
      caseStudyProofStatus: "internal_draft_ready" as const,
      publishProofStatus: "proof_skipped_awaiting_customer_approval" as const,
      pilotMetricsArtifactLoaded: true,
      pilotMetricsOverall: "PASSED",
      customerApprovalStatus: null,
      certPassed: true,
    };
    expect(
      resolveWeek1CompleteForMonth2({
        goNoGoSummary: goSummary,
        metricsBaseline: metrics,
        caseStudyDraft: caseStudy,
        env: week1Env,
      }),
    ).toBe(true);
  });

  it("builds five workstreams after prerequisites", () => {
    const prerequisites = resolveMonth2MarketReadinessPrerequisites({
      goDecision: "GO",
      week1Complete: true,
    });
    const phases = buildMonth2MarketReadinessPhaseStatuses({
      prerequisites,
      goNoGoSummary: goSummary,
      metricsBaseline: null,
      caseStudyDraft: null,
      investorOnepager: null,
      env: {},
    });
    expect(phases).toHaveLength(5);
    expect(phases.filter((phase) => !phase.optional)).toHaveLength(3);
    expect(resolveNextIncompleteMonth2MarketReadinessPhase(phases)?.id).toBe(
      "workstream_a_investor_onepager",
    );
  });

  it("completes Month 2 when blocking workstreams pass", () => {
    const prerequisites = resolveMonth2MarketReadinessPrerequisites({
      goDecision: "GO",
      week1Complete: true,
    });
    const phases = buildMonth2MarketReadinessPhaseStatuses({
      prerequisites,
      goNoGoSummary: goSummary,
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
        MONTH2_INVESTOR_FOUNDER_SIGNOFF: "1",
        MONTH2_GTM_GHOST_KITCHEN_LANDING_REVIEWED: "1",
        MONTH2_GTM_MEAL_PREP_LANDING_REVIEWED: "1",
        PILOT_CASE_STUDY_CUSTOMER_APPROVAL: "signed",
      },
    });
    expect(resolveMonth2MarketReadinessComplete(phases)).toBe(true);
  });
});

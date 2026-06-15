import { describe, expect, it } from "vitest";

import {
  buildScaleReadinessPhaseStatuses,
  resolveMonth2CompleteForScale,
  resolveScaleReadinessComplete,
  resolveScaleReadinessPrerequisites,
  resolveNextIncompleteScaleReadinessPhase,
} from "@/lib/commercial/scale-readiness-phases-era21";

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

const month2CompleteArtifacts = {
  metricsBaseline: {
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
  },
  caseStudyDraft: {
    version: "era17-pilot-case-study-draft-v1" as const,
    runAt: new Date().toISOString(),
    commitSha: "abc",
    overall: "PASSED" as const,
    caseStudyProofStatus: "internal_draft_ready" as const,
    publishProofStatus: "proof_ready_for_publish" as const,
    pilotMetricsArtifactLoaded: true,
    pilotMetricsOverall: "PASSED",
    customerApprovalStatus: "signed",
    certPassed: true,
  },
  investorOnepager: {
    version: "era17-investor-narrative-onepager-v2-v1" as const,
    runAt: new Date().toISOString(),
    commitSha: "abc",
    overall: "PASSED" as const,
    narrativeProofStatus: "proof_ready_with_metrics" as const,
    pilotMetricsArtifactLoaded: true,
    pilotMetricsOverall: "PASSED",
    pilotMetricsBaselineProofStatus: "proof_captured",
    pilotMetricsCapturedCount: 6,
    certPassed: true,
  },
  week1Env: {
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
};

describe("scale-readiness-phases-era21", () => {
  it("requires GO and Month 2 complete for prerequisites", () => {
    expect(
      resolveScaleReadinessPrerequisites({
        goDecision: "GO",
        month2Complete: false,
      }).prerequisitesComplete,
    ).toBe(false);
    expect(
      resolveScaleReadinessPrerequisites({
        goDecision: "GO",
        month2Complete: true,
      }).prerequisitesComplete,
    ).toBe(true);
  });

  it("detects Month 2 complete from artifacts", () => {
    expect(
      resolveMonth2CompleteForScale({
        goNoGoSummary: goSummary,
        metricsBaseline: month2CompleteArtifacts.metricsBaseline,
        caseStudyDraft: month2CompleteArtifacts.caseStudyDraft,
        investorOnepager: month2CompleteArtifacts.investorOnepager,
        env: month2CompleteArtifacts.week1Env,
      }),
    ).toBe(true);
  });

  it("builds six gates after prerequisites", () => {
    const prerequisites = resolveScaleReadinessPrerequisites({
      goDecision: "GO",
      month2Complete: true,
    });
    const phases = buildScaleReadinessPhaseStatuses({
      prerequisites,
      goNoGoSummary: goSummary,
      p0Staging: null,
      tier2Summary: null,
      metricsBaseline: null,
      caseStudyDraft: null,
      investorOnepager: null,
      rollbackDrill: null,
      env: {},
    });
    expect(phases).toHaveLength(6);
    expect(phases.filter((phase) => !phase.optional)).toHaveLength(5);
    expect(resolveNextIncompleteScaleReadinessPhase(phases)?.id).toBe(
      "gate1_per_customer_pilot_ops",
    );
  });

  it("completes scale readiness when blocking gates pass", () => {
    const prerequisites = resolveScaleReadinessPrerequisites({
      goDecision: "GO",
      month2Complete: true,
    });
    const phases = buildScaleReadinessPhaseStatuses({
      prerequisites,
      goNoGoSummary: goSummary,
      p0Staging: {
        version: "era17-p0-staging-proof-unblock-v1",
        runAt: new Date().toISOString(),
        commitSha: "abc",
        overall: "PASSED",
        p0ProofStatus: "proof_passed",
        defaultProofStatus: "awaiting_ops_credentials",
        allMissingEnvVars: [],
        children: {
          ssoIdpStaging: {
            smokeScript: "smoke:enterprise-sso-idp-staging",
            artifactPath: "x",
            overall: "PASSED",
            proofStatus: "proof_passed",
            missingEnvVars: [],
          },
          stagingWorkflowsFirstGreen: {
            smokeScript: "x",
            artifactPath: "x",
            overall: "PASSED",
            proofStatus: "proof_passed",
            missingEnvVars: [],
          },
          channelLive: {
            smokeScript: "x",
            artifactPath: "x",
            overall: "PASSED",
            proofStatus: "proof_passed",
            missingEnvVars: [],
          },
        },
      },
      tier2Summary: {
        version: "era20-tier2-staging-golden-path-v1",
        runAt: new Date().toISOString(),
        commitSha: "abc",
        overall: "PASSED",
        tier2ProofStatus: "proof_passed",
        p0ProofStatus: "proof_passed",
        steps: [],
        missingManualEnvVars: [],
        playbookDoc: "docs/x.md",
      },
      metricsBaseline: month2CompleteArtifacts.metricsBaseline,
      caseStudyDraft: month2CompleteArtifacts.caseStudyDraft,
      investorOnepager: month2CompleteArtifacts.investorOnepager,
      rollbackDrill: {
        version: "era17-pilot-rollback-drill-v1",
        policyId: "era17-pilot-rollback-drill-v1",
        runAt: new Date().toISOString(),
        drillMode: "tabletop",
        rollbackProofStatus: "proof_passed",
        stagingUrl: null,
        operatorEmail: null,
        rollbackReason: null,
        commitSha: "abc",
        retrospective: { outcome: null, lessons: null, recorded: false },
        steps: [],
        passedStepCount: 5,
        totalSteps: 5,
      },
      env: {
        SCALE_PER_CUSTOMER_GO_ISOLATION: "1",
        SCALE_SOC2_READINESS_TRACK_REVIEWED: "1",
        SCALE_SSO_PRODUCTION_STATUS: "pass",
        SCALE_RESILIENCE_DRILLS_ATTESTED: "1",
        SCALE_DATA_ROOM_INDEX_PUBLISHED: "1",
      },
    });
    expect(resolveScaleReadinessComplete(phases)).toBe(true);
  });
});

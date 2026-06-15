import { describe, expect, it } from "vitest";

import {
  buildSustainedOperationalExcellencePhaseStatuses,
  resolveMarketLeaderCompleteForSustainedOps,
  resolveNextIncompleteSustainedOperationalExcellencePhase,
  resolveSustainedOperationalExcellenceComplete,
  resolveSustainedOperationalExcellencePrerequisites,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";

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

const fullArtifacts = {
  metricsBaseline: {
    version: "era17-pilot-metrics-baseline-v1" as const,
    policyId: "era17-pilot-metrics-baseline-v1" as const,
    runAt: new Date().toISOString(),
    overall: "PASSED" as const,
    baselineProofStatus: "proof_captured" as const,
    pilotWeek: 8,
    customerRef: "Acme",
    capturedAt: new Date().toISOString(),
    metrics: [
      {
        id: "operator_feedback_score",
        label: "Operator feedback score",
        status: "captured" as const,
        value: 4.2,
        unit: "score_1_5",
      },
      {
        id: "support_tickets_per_week",
        label: "Support tickets per week",
        status: "captured" as const,
        value: 3,
        unit: "tickets/week",
      },
    ],
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
        smokeScript: "x",
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
        smokeScript: "smoke:woo-shopify-live",
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
  competitorMatrix: {
    version: "era17-competitor-feature-gap-matrix-v1" as const,
    runAt: new Date().toISOString(),
    commitSha: "abc",
    overall: "PASSED" as const,
    matrixProofStatus: "evidence_aligned_era17" as const,
    certPassed: true,
    requiredCompetitorCount: 3,
  },
  fullChainEnv: {
    PILOT_WEEK1_TTV_HOURS: "6",
    PILOT_WEEK1_FIRST_ORDER_ID: "ord_123",
    PILOT_WEEK1_INTEGRATION_HEALTH_REVIEWED: "1",
    PILOT_WEEK1_POS_CLOSEOUT_STATUS: "pass",
    PILOT_WEEK1_REPORTS_WEEKLY_EXPORT: "1",
    MONTH2_INVESTOR_FOUNDER_SIGNOFF: "1",
    MONTH2_GTM_GHOST_KITCHEN_LANDING_REVIEWED: "1",
    MONTH2_GTM_MEAL_PREP_LANDING_REVIEWED: "1",
    PILOT_CASE_STUDY_CUSTOMER_APPROVAL: "signed",
    SCALE_PER_CUSTOMER_GO_ISOLATION: "1",
    SCALE_SOC2_READINESS_TRACK_REVIEWED: "1",
    SCALE_SSO_PRODUCTION_STATUS: "pass",
    SCALE_RESILIENCE_DRILLS_ATTESTED: "1",
    SCALE_DATA_ROOM_INDEX_PUBLISHED: "1",
    SERIES_A_DATA_ROOM_BUNDLE_PUBLISHED: "1",
    SERIES_A_PARTNER_ONEPAGER_REVIEWED: "1",
    SERIES_A_MULTI_REGION_PLAYBOOK_DRAFTED: "1",
    SERIES_A_MARKETING_CLAIMS_STRICT_REVIEWED: "1",
    SERIES_A_CS_PLAYBOOK_REVIEWED: "1",
    MARKET_LEADER_CATEGORY_NARRATIVE_REVIEWED: "1",
    MARKET_LEADER_MOAT_DECK_REVIEWED: "1",
    MARKET_LEADER_ANALYST_KIT_PUBLISHED: "1",
    MARKET_LEADER_EXPANSION_MOTION_REVIEWED: "1",
  },
};

describe("sustained-operational-excellence-phases-era21", () => {
  it("requires GO and market leader complete for prerequisites", () => {
    expect(
      resolveSustainedOperationalExcellencePrerequisites({
        goDecision: "GO",
        marketLeaderComplete: false,
      }).prerequisitesComplete,
    ).toBe(false);
    expect(
      resolveSustainedOperationalExcellencePrerequisites({
        goDecision: "GO",
        marketLeaderComplete: true,
      }).prerequisitesComplete,
    ).toBe(true);
  });

  it("detects market leader complete from artifacts", () => {
    expect(
      resolveMarketLeaderCompleteForSustainedOps({
        goNoGoSummary: goSummary,
        p0Staging: fullArtifacts.p0Staging,
        tier2Summary: fullArtifacts.tier2Summary,
        metricsBaseline: fullArtifacts.metricsBaseline,
        caseStudyDraft: fullArtifacts.caseStudyDraft,
        investorOnepager: fullArtifacts.investorOnepager,
        rollbackDrill: fullArtifacts.rollbackDrill,
        competitorMatrix: fullArtifacts.competitorMatrix,
        env: fullArtifacts.fullChainEnv,
      }),
    ).toBe(true);
  });

  it("builds four cadences after prerequisites", () => {
    const prerequisites = resolveSustainedOperationalExcellencePrerequisites({
      goDecision: "GO",
      marketLeaderComplete: true,
    });
    const phases = buildSustainedOperationalExcellencePhaseStatuses({
      prerequisites,
      goNoGoSummary: goSummary,
      p0Staging: fullArtifacts.p0Staging,
      tier2Summary: fullArtifacts.tier2Summary,
      metricsBaseline: fullArtifacts.metricsBaseline,
      competitorMatrix: fullArtifacts.competitorMatrix,
      env: fullArtifacts.fullChainEnv,
    });
    expect(phases).toHaveLength(4);
    expect(phases.filter((phase) => !phase.optional)).toHaveLength(4);
    expect(resolveNextIncompleteSustainedOperationalExcellencePhase(phases)?.id).toBe(
      "cadence_a_daily_operational",
    );
  });

  it("completes sustained ops when all cadences pass", () => {
    const prerequisites = resolveSustainedOperationalExcellencePrerequisites({
      goDecision: "GO",
      marketLeaderComplete: true,
    });
    const phases = buildSustainedOperationalExcellencePhaseStatuses({
      prerequisites,
      goNoGoSummary: goSummary,
      p0Staging: fullArtifacts.p0Staging,
      tier2Summary: fullArtifacts.tier2Summary,
      metricsBaseline: fullArtifacts.metricsBaseline,
      competitorMatrix: fullArtifacts.competitorMatrix,
      env: {
        ...fullArtifacts.fullChainEnv,
        SUSTAINED_OPS_DAILY_CADENCE_ATTESTED: "1",
        SUSTAINED_OPS_WEEKLY_INTEGRATION_REVIEWED: "1",
        SUSTAINED_OPS_MONTHLY_METRICS_REFRESHED: "1",
        SUSTAINED_OPS_QUARTERLY_GOVERNANCE_AUDITED: "1",
      },
    });
    expect(resolveSustainedOperationalExcellenceComplete(phases)).toBe(true);
  });
});

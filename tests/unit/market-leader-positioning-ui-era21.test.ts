import { describe, expect, it } from "vitest";

import {
  buildMarketLeaderPositioningUiSlice,
  formatMarketLeaderPositioningProgressLabel,
} from "@/lib/commercial/market-leader-positioning-ui-era21";
import { resolveSeriesACompleteForMarketLeader } from "@/lib/commercial/market-leader-positioning-phases-era21";

const seriesACompleteEnv = {
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
};

const honestGo = {
  version: "era17-pilot-gono-go-v1" as const,
  runAt: new Date().toISOString(),
  decision: "GO" as const,
  blockers: [] as string[],
  warnings: [] as string[],
  customerExecutionStatus: "recorded" as const,
  customerName: "Acme Kitchen",
  loiSignedDate: "2026-06-01",
  prospectExecutionStatus: "none" as const,
  prospectName: null,
  icpQualification: { qualified: true, missingCriteria: [], disqualifiers: [] },
  evidenceGates: [
    { id: "tier0", label: "t0", pass: true, reason: "ok" },
    { id: "tier1", label: "t1", pass: true, reason: "ok" },
    { id: "tier2", label: "t2", pass: true, reason: "ok" },
    { id: "icp_qualification", label: "icp", pass: true, reason: "ok" },
    { id: "forbidden_claims_enforcement", label: "fc", pass: true, reason: "ok" },
    { id: "p0_staging_proof", label: "p0", pass: true, reason: "ok" },
  ],
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

const capturedMetrics = [
  "orders_per_day",
  "storefront_checkout_success_rate",
  "pos_checkout_completion",
  "kds_bump_rate",
  "support_tickets_per_week",
  "operator_feedback_score",
].map((id) => ({
  id,
  label: id,
  status: "captured" as const,
  value: 1,
  unit: "n/a",
  reason: "test fixture",
}));

const honestRollback = {
  version: "era17-pilot-rollback-drill-v1" as const,
  policyId: "era17-pilot-rollback-drill-v1" as const,
  runAt: new Date().toISOString(),
  drillMode: "tabletop" as const,
  rollbackProofStatus: "proof_passed" as const,
  stagingUrl: null,
  operatorEmail: null,
  rollbackReason: null,
  commitSha: "abc",
  retrospective: { outcome: null, lessons: null, recorded: false },
  steps: [{ order: 1, action: "isolate", owner: "ops", status: "PASSED" as const, reason: null }],
  passedStepCount: 1,
  totalSteps: 1,
};

describe("market-leader-positioning-ui-era21", () => {
  it("returns null when Series A is incomplete", () => {
    expect(
      buildMarketLeaderPositioningUiSlice({
        goNoGoSummary: honestGo,
        env: {},
      }),
    ).toBeNull();
  });

  it("visible when Series A complete and market leader pillars remain", () => {
    const fixtureInput = {
      goNoGoSummary: honestGo,
      p0ProofStatus: "proof_passed",
      tier2ProofStatus: "proof_passed",
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
      metricsBaseline: {
        version: "era17-pilot-metrics-baseline-v1",
        policyId: "era17-pilot-metrics-baseline-v1",
        runAt: new Date().toISOString(),
        overall: "PASSED",
        baselineProofStatus: "proof_captured",
        pilotWeek: 8,
        customerRef: "Acme",
        capturedAt: new Date().toISOString(),
        metrics: capturedMetrics,
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
      rollbackDrill: honestRollback,
      competitorMatrix: {
        version: "era17-competitor-feature-gap-matrix-v1",
        runAt: new Date().toISOString(),
        commitSha: "abc",
        overall: "PASSED",
        matrixProofStatus: "evidence_aligned_era17",
        certPassed: true,
        requiredCompetitorCount: 3,
      },
      env: seriesACompleteEnv,
    } as const;
    expect(resolveSeriesACompleteForMarketLeader(fixtureInput)).toBe(true);

    const slice = buildMarketLeaderPositioningUiSlice({
      ...fixtureInput,
    });
    expect(slice?.blocked).toBe(true);
    expect(slice?.seriesAComplete).toBe(true);
    expect(slice?.marketLeaderMilestone).toBe("pillar1_category_narrative");
    expect(slice?.postSeriesAOrchestratorCommand).toContain(
      "run-market-leader-positioning-post-series-a-orchestrator",
    );
    expect(slice?.integrityValidateCommand).toContain(
      "validate-market-leader-positioning-integrity",
    );
    expect(formatMarketLeaderPositioningProgressLabel(slice!)).toContain("Acme Kitchen");
  });

  it("visible when MARKET_LEADER env present but Series A incomplete (integrity blocked)", () => {
    const slice = buildMarketLeaderPositioningUiSlice({
      goNoGoSummary: honestGo,
      p0ProofStatus: "proof_passed",
      tier2ProofStatus: "proof_passed",
      env: { MARKET_LEADER_CATEGORY_NARRATIVE_REVIEWED: "1" },
    });
    expect(slice?.visible).toBe(true);
    expect(slice?.seriesAComplete).toBe(false);
    expect(slice?.marketLeaderIntegrityPassed).toBe(false);
  });
});

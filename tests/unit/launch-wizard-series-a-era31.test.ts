import { describe, expect, it } from "vitest";

import { buildSeriesAPartnerExpansionUiSlice } from "@/lib/commercial/series-a-partner-expansion-ui-era21";
import {
  buildLaunchWizardSeriesASlice,
  launchWizardSeriesAHref,
} from "@/lib/launch-wizard/launch-wizard-series-a-era31";

const scaleCompleteEnv = {
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
};

const honestGo = {
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

describe("launch-wizard-series-a-era31", () => {
  it("builds slice with integrity flags when Series A active", () => {
    const seriesA = buildSeriesAPartnerExpansionUiSlice({
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
        steps: [{ order: 1, action: "a", owner: "ops", status: "PASSED", reason: null }],
        passedStepCount: 1,
        totalSteps: 1,
      },
      env: { ...scaleCompleteEnv, SERIES_A_DATA_ROOM_BUNDLE_PUBLISHED: "1" },
    });
    const slice = buildLaunchWizardSeriesASlice(seriesA);
    expect(slice).not.toBeNull();
    expect(slice!.seriesAIntegrityFailed).toBe(false);
    expect(slice?.progressLabel).toContain("/");
    expect(launchWizardSeriesAHref()).toContain("#launch-wizard-series-a");
  });
});

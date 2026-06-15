import { describe, expect, it } from "vitest";

import { evaluateScaleReadinessIntegrity } from "@/lib/commercial/scale-readiness-integrity-era30";
import {
  buildScaleReadinessUiSlice,
  formatScaleReadinessProgressLabel,
} from "@/lib/commercial/scale-readiness-ui-era21";

const goSummary = {
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

const month2CompleteInput = {
  p0ProofStatus: "proof_passed",
  tier2ProofStatus: "proof_passed",
  metricsBaseline: {
    version: "era17-pilot-metrics-baseline-v1" as const,
    policyId: "era17-pilot-metrics-baseline-v1" as const,
    runAt: new Date().toISOString(),
    overall: "PASSED" as const,
    baselineProofStatus: "proof_captured" as const,
    pilotWeek: 1,
    customerRef: "Acme",
    capturedAt: new Date().toISOString(),
    metrics: capturedMetrics,
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
    version: "era17-investor-narrative-onepager-v2-v1",
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
};

describe("scale-readiness-ui-era21", () => {
  it("visible when Month 2 complete and scale gates remain", () => {
    const slice = buildScaleReadinessUiSlice({
      goNoGoSummary: goSummary,
      ...month2CompleteInput,
    });
    expect(slice?.blocked).toBe(true);
    expect(slice?.month2Complete).toBe(true);
    expect(slice?.scaleMilestone).toBe("gate1_per_customer_pilot_ops");
    expect(slice?.integrityValidateCommand).toContain("validate-scale-readiness-integrity");
    expect(slice?.postMonth2OrchestratorCommand).toContain(
      "run-scale-readiness-post-month2-orchestrator",
    );
    expect(formatScaleReadinessProgressLabel(slice!)).toContain("Acme Kitchen");
  });

  it("hidden when Month 2 incomplete", () => {
    expect(
      buildScaleReadinessUiSlice({
        goNoGoSummary: goSummary,
      }),
    ).toBeNull();
  });
});

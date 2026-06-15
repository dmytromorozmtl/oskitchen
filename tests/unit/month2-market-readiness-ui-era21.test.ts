import { describe, expect, it } from "vitest";

import { evaluateMonth2MarketReadinessIntegrity } from "@/lib/commercial/month2-market-readiness-integrity-era29";
import {
  buildMonth2MarketReadinessUiSlice,
  formatMonth2MarketReadinessProgressLabel,
} from "@/lib/commercial/month2-market-readiness-ui-era21";

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

const week1CompleteInput = {
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
    publishProofStatus: "proof_skipped_awaiting_customer_approval" as const,
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
};

describe("month2-market-readiness-ui-era21", () => {
  it("visible when Week 1 complete and Month 2 blocking workstreams remain", () => {
    const slice = buildMonth2MarketReadinessUiSlice({
      goNoGoSummary: goSummary,
      ...week1CompleteInput,
    });
    expect(slice?.blocked).toBe(true);
    expect(slice?.week1Complete).toBe(true);
    expect(slice?.month2Milestone).toBe("workstream_a_investor_onepager");
    expect(slice?.postWeek1OrchestratorCommand).toContain(
      "run-month2-market-readiness-post-week1-orchestrator",
    );
    expect(slice?.integrityValidateCommand).toContain(
      "validate-month2-market-readiness-integrity",
    );
    expect(slice?.phases.length).toBe(5);
    expect(formatMonth2MarketReadinessProgressLabel(slice!)).toContain("Acme Kitchen");
  });

  it("hidden when Week 1 incomplete", () => {
    expect(
      buildMonth2MarketReadinessUiSlice({
        goNoGoSummary: goSummary,
      }),
    ).toBeNull();
  });

  it("hidden when Month 2 complete", () => {
    const input = {
      goNoGoSummary: goSummary,
      ...week1CompleteInput,
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
      env: {
        ...week1CompleteInput.env,
        MONTH2_INVESTOR_FOUNDER_SIGNOFF: "1",
        MONTH2_GTM_GHOST_KITCHEN_LANDING_REVIEWED: "1",
        MONTH2_GTM_MEAL_PREP_LANDING_REVIEWED: "1",
        PILOT_CASE_STUDY_CUSTOMER_APPROVAL: "signed",
      },
      caseStudyDraft: {
        ...week1CompleteInput.caseStudyDraft,
        publishProofStatus: "proof_ready_for_publish" as const,
        customerApprovalStatus: "signed",
      },
    };
    const integrity = evaluateMonth2MarketReadinessIntegrity(process.cwd(), {
      env: input.env,
      goNoGoOverride: input.goNoGoSummary,
      metricsBaselineOverride: input.metricsBaseline,
      caseStudyDraftOverride: input.caseStudyDraft,
      investorOnepagerOverride: input.investorOnepager,
      p0ProofStatusOverride: input.p0ProofStatus,
      tier2ProofStatusOverride: input.tier2ProofStatus,
      baselineOverride: null,
    });
    expect(integrity.integrityPassed, integrity.violations.map((v) => v.id).join(",")).toBe(true);
    expect(buildMonth2MarketReadinessUiSlice(input)).toBeNull();
  });
});

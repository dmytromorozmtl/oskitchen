import { describe, expect, it } from "vitest";

import {
  buildMarketLeaderPositioningPhaseStatuses,
  resolveMarketLeaderPositioningComplete,
  resolveMarketLeaderPositioningPrerequisites,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import {
  buildMarketLeaderPositioningExecutionGates,
  buildMarketLeaderPositioningExecutionSummary,
  resolveMarketLeaderPositioningExecutionMilestone,
} from "@/lib/ops/market-leader-positioning-execution-orchestrator";

const COMPLETE_PILLAR_ENV: NodeJS.ProcessEnv = {
  MARKET_LEADER_CATEGORY_NARRATIVE_REVIEWED: "1",
  PILOT_CASE_STUDY_CUSTOMER_APPROVAL: "signed",
  MARKET_LEADER_MOAT_DECK_REVIEWED: "1",
  PILOT_WEEK1_TTV_HOURS: "4",
  PILOT_WEEK1_POS_CLOSEOUT_STATUS: "pass",
  MARKET_LEADER_ANALYST_KIT_PUBLISHED: "1",
  SERIES_A_DATA_ROOM_BUNDLE_PUBLISHED: "1",
  MARKET_LEADER_EXPANSION_MOTION_REVIEWED: "1",
  SERIES_A_PARTNER_ONEPAGER_REVIEWED: "1",
  SERIES_A_CS_PLAYBOOK_REVIEWED: "1",
  SCALE_PER_CUSTOMER_GO_ISOLATION: "1",
  MONTH2_GTM_GHOST_KITCHEN_LANDING_REVIEWED: "1",
  MONTH2_GTM_MEAL_PREP_LANDING_REVIEWED: "1",
};

function buildCompletePillars(input?: { env?: NodeJS.ProcessEnv }) {
  const prerequisites = resolveMarketLeaderPositioningPrerequisites({
    goDecision: "GO",
    seriesAComplete: true,
  });
  return buildMarketLeaderPositioningPhaseStatuses({
    prerequisites,
    goNoGoSummary: {
      version: "era17-pilot-gono-go-v1",
      policyId: "era17-pilot-gono-go-v1",
      runAt: "2026-05-29T00:00:00.000Z",
      decision: "GO",
      customerName: "Test Operator",
      blockers: [],
      overall: "PASSED",
      goProofStatus: "proof_passed",
      steps: [],
    },
    p0Staging: {
      version: "era17-p0-staging-proof-unblock-v1",
      policyId: "era17-p0-staging-proof-unblock-v1",
      runAt: "2026-05-29T00:00:00.000Z",
      p0ProofStatus: "proof_passed",
      overall: "PASSED",
      children: {
        channelLive: { overall: "PASSED", steps: [] },
        stagingWorkflows: { overall: "PASSED", steps: [] },
        enterpriseSso: { overall: "SKIPPED", steps: [] },
      },
      steps: [],
    },
    tier2Summary: {
      version: "era21-tier2-staging-golden-path-v1",
      policyId: "era21-tier2-staging-golden-path-v1",
      runAt: "2026-05-29T00:00:00.000Z",
      tier2ProofStatus: "proof_passed",
      overall: "PASSED",
      steps: [],
    },
    metricsBaseline: {
      version: "era17-pilot-metrics-baseline-v1",
      policyId: "era17-pilot-metrics-baseline-v1",
      runAt: "2026-05-29T00:00:00.000Z",
      overall: "PASSED",
      metrics: [],
    },
    caseStudyDraft: {
      version: "era17-pilot-case-study-draft-v1",
      policyId: "era17-pilot-case-study-draft-v1",
      runAt: "2026-05-29T00:00:00.000Z",
      caseStudyProofStatus: "internal_draft_ready",
      customerApprovalStatus: "signed",
      overall: "PASSED",
      steps: [],
    },
    investorOnepager: {
      version: "era17-investor-narrative-onepager-v2-v1",
      policyId: "era17-investor-narrative-onepager-v2-v1",
      runAt: "2026-05-29T00:00:00.000Z",
      overall: "PASSED",
      narrativeProofStatus: "proof_ready_with_metrics",
      steps: [],
    },
    rollbackDrill: {
      version: "era17-pilot-rollback-drill-v1",
      policyId: "era17-pilot-rollback-drill-v1",
      runAt: "2026-05-29T00:00:00.000Z",
      drillMode: "staging",
      rollbackProofStatus: "proof_passed",
      stagingUrl: null,
      steps: [],
      retrospective: { outcome: null, lessons: null, recorded: false },
      overall: "PASSED",
    },
    competitorMatrix: {
      version: "era17-competitor-feature-gap-matrix-v1",
      policyId: "era17-competitor-feature-gap-matrix-v1",
      runAt: "2026-05-29T00:00:00.000Z",
      overall: "PASSED",
      matrixProofStatus: "evidence_aligned_era17",
      steps: [],
    },
    env: input?.env ?? COMPLETE_PILLAR_ENV,
  });
}

describe("market-leader-positioning-execution-orchestrator", () => {
  it("resolves series_a_expansion_blocked before pillars", () => {
    const pillars = buildCompletePillars();
    expect(
      resolveMarketLeaderPositioningExecutionMilestone({
        seriesAExpansionPassed: false,
        pillars,
        marketLeaderIntegrityPassed: true,
      }),
    ).toBe("series_a_expansion_blocked");
  });

  it("resolves awaiting_pillar1 when series A passed but pillars incomplete", () => {
    const pillars = buildCompletePillars({
      env: { ...COMPLETE_PILLAR_ENV, MARKET_LEADER_CATEGORY_NARRATIVE_REVIEWED: undefined },
    });
    expect(
      resolveMarketLeaderPositioningExecutionMilestone({
        seriesAExpansionPassed: true,
        pillars,
        marketLeaderIntegrityPassed: true,
      }),
    ).toBe("awaiting_pillar1_category_narrative");
  });

  it("resolves market_leader_positioning_passed when pillars and integrity pass", () => {
    const pillars = buildCompletePillars();
    expect(
      resolveMarketLeaderPositioningExecutionMilestone({
        seriesAExpansionPassed: true,
        pillars,
        marketLeaderIntegrityPassed: true,
      }),
    ).toBe("market_leader_positioning_passed");
  });

  it("never reports market_leader_positioning_passed when series A blocked", () => {
    const summary = buildMarketLeaderPositioningExecutionSummary({
      seriesAExpansion: {
        version: "series-a-partner-expansion-execution-v1",
        policyId: "era36-series-a-partner-expansion-execution-v1",
        generatedAt: "2026-05-29T00:00:00.000Z",
        milestone: "production_ga_blocked",
        productionGaMilestone: "scale_expansion_blocked",
        goDecision: "NO-GO",
        customerName: null,
        tracksComplete: false,
        scaleComplete: false,
        seriesAIntegrityPassed: false,
        commercialInflectionMilestone: "p0_ops_vault_blocked",
        pilotExecutableScore: 24,
        phases: [],
        gates: [],
        nextPhase: null,
        recommendedCommands: [],
        productSurfaces: [],
        honestyNote: "test",
      },
    });
    expect(summary.milestone).toBe("series_a_expansion_blocked");
    expect(summary.milestone).not.toBe("market_leader_positioning_passed");
  });

  it("builds eight execution gates", () => {
    const gates = buildMarketLeaderPositioningExecutionGates({
      seriesAExpansionPassed: false,
      seriesAExpansionMilestone: "production_ga_blocked",
      pillarsComplete: false,
      seriesAComplete: false,
      marketLeaderIntegrityPassed: true,
      commercialInflectionMilestone: "p0_ops_vault_blocked",
      goDecision: "NO-GO",
      caseStudyApproved: false,
      moatEvidenceReady: false,
      investorReady: false,
      competitorAligned: false,
    });
    expect(gates).toHaveLength(8);
    expect(gates.find((g) => g.id === "series_a_expansion")?.complete).toBe(false);
  });

  it("pillar completion requires blocking pillars only", () => {
    const incomplete = buildCompletePillars({
      env: { ...COMPLETE_PILLAR_ENV, MARKET_LEADER_MOAT_DECK_REVIEWED: undefined },
    });
    expect(resolveMarketLeaderPositioningComplete(incomplete)).toBe(false);
    const complete = buildCompletePillars();
    expect(resolveMarketLeaderPositioningComplete(complete)).toBe(true);
  });
});

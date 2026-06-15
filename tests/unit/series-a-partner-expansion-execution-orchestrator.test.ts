import { describe, expect, it } from "vitest";

import {
  buildSeriesAPartnerExpansionPhaseStatuses,
  resolveSeriesAPartnerExpansionComplete,
  resolveSeriesAPartnerExpansionPrerequisites,
} from "@/lib/commercial/series-a-partner-expansion-phases-era21";
import {
  buildSeriesAPartnerExpansionExecutionGates,
  buildSeriesAPartnerExpansionExecutionSummary,
  resolveSeriesAPartnerExpansionExecutionMilestone,
} from "@/lib/ops/series-a-partner-expansion-execution-orchestrator";

const COMPLETE_TRACK_ENV: NodeJS.ProcessEnv = {
  SERIES_A_DATA_ROOM_BUNDLE_PUBLISHED: "1",
  SCALE_DATA_ROOM_INDEX_PUBLISHED: "1",
  SERIES_A_PARTNER_ONEPAGER_REVIEWED: "1",
  SERIES_A_MULTI_REGION_PLAYBOOK_DRAFTED: "1",
  SERIES_A_MARKETING_CLAIMS_STRICT_REVIEWED: "1",
  SCALE_PER_CUSTOMER_GO_ISOLATION: "1",
  SERIES_A_CS_PLAYBOOK_REVIEWED: "1",
  PILOT_METRICS_OPERATOR_FEEDBACK_SCORE: "8",
  PILOT_METRICS_SUPPORT_TICKETS_PER_WEEK: "3",
};

function buildCompleteTracks(input?: {
  p0ProofPassed?: boolean;
  tier2ProofPassed?: boolean;
  metricsPassed?: boolean;
  competitorAligned?: boolean;
  env?: NodeJS.ProcessEnv;
}) {
  const prerequisites = resolveSeriesAPartnerExpansionPrerequisites({
    goDecision: "GO",
    scaleComplete: true,
  });
  return buildSeriesAPartnerExpansionPhaseStatuses({
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
    p0Staging:
      input?.p0ProofPassed !== false
        ? {
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
          }
        : null,
    tier2Summary:
      input?.tier2ProofPassed !== false
        ? {
            version: "era21-tier2-staging-golden-path-v1",
            policyId: "era21-tier2-staging-golden-path-v1",
            runAt: "2026-05-29T00:00:00.000Z",
            tier2ProofStatus: "proof_passed",
            overall: "PASSED",
            steps: [],
          }
        : null,
    metricsBaseline:
      input?.metricsPassed !== false
        ? {
            version: "era17-pilot-metrics-baseline-v1",
            policyId: "era17-pilot-metrics-baseline-v1",
            runAt: "2026-05-29T00:00:00.000Z",
            overall: "PASSED",
            metrics: [
              { id: "operator_feedback_score", status: "captured", value: "8" },
              { id: "support_tickets_per_week", status: "captured", value: "3" },
            ],
          }
        : null,
    caseStudyDraft: {
      version: "era17-pilot-case-study-draft-v1",
      policyId: "era17-pilot-case-study-draft-v1",
      runAt: "2026-05-29T00:00:00.000Z",
      caseStudyProofStatus: "internal_draft_ready",
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
    competitorMatrix:
      input?.competitorAligned !== false
        ? {
            version: "era17-competitor-feature-gap-matrix-v1",
            policyId: "era17-competitor-feature-gap-matrix-v1",
            runAt: "2026-05-29T00:00:00.000Z",
            overall: "PASSED",
            matrixProofStatus: "evidence_aligned_era17",
            steps: [],
          }
        : null,
    env: input?.env ?? COMPLETE_TRACK_ENV,
  });
}

describe("series-a-partner-expansion-execution-orchestrator", () => {
  it("resolves production_ga_blocked before tracks", () => {
    const tracks = buildCompleteTracks();
    expect(
      resolveSeriesAPartnerExpansionExecutionMilestone({
        productionGaPassed: false,
        tracks,
        seriesAIntegrityPassed: true,
      }),
    ).toBe("production_ga_blocked");
  });

  it("resolves awaiting_track_a when production GA passed but tracks incomplete", () => {
    const tracks = buildCompleteTracks({ competitorAligned: false });
    expect(
      resolveSeriesAPartnerExpansionExecutionMilestone({
        productionGaPassed: true,
        tracks,
        seriesAIntegrityPassed: true,
      }),
    ).toBe("awaiting_track_a_series_a_data_room");
  });

  it("resolves series_a_partner_expansion_passed when tracks and integrity pass", () => {
    const tracks = buildCompleteTracks();
    expect(
      resolveSeriesAPartnerExpansionExecutionMilestone({
        productionGaPassed: true,
        tracks,
        seriesAIntegrityPassed: true,
      }),
    ).toBe("series_a_partner_expansion_passed");
  });

  it("never reports series_a_partner_expansion_passed when production GA blocked", () => {
    const summary = buildSeriesAPartnerExpansionExecutionSummary({
      productionGa: {
        version: "production-ga-execution-v1",
        policyId: "era35-production-ga-execution-v1",
        generatedAt: "2026-05-29T00:00:00.000Z",
        milestone: "scale_expansion_blocked",
        scaleExpansionMilestone: "week1_execution_blocked",
        goDecision: "NO-GO",
        customerName: null,
        gaPhasesComplete: false,
        scaleComplete: false,
        scaleIntegrityPassed: false,
        commercialInflectionMilestone: "p0_ops_vault_blocked",
        pilotExecutableScore: 24,
        p0ProofStatus: "awaiting_ops_credentials",
        tier2ProofStatus: "missing",
        phases: [],
        gates: [],
        nextPhase: null,
        recommendedCommands: [],
        productSurfaces: [],
        honestyNote: "test",
      },
    });
    expect(summary.milestone).toBe("production_ga_blocked");
    expect(summary.milestone).not.toBe("series_a_partner_expansion_passed");
  });

  it("builds seven execution gates", () => {
    const gates = buildSeriesAPartnerExpansionExecutionGates({
      productionGaPassed: false,
      productionGaMilestone: "scale_expansion_blocked",
      tracksComplete: false,
      scaleComplete: false,
      seriesAIntegrityPassed: true,
      commercialInflectionMilestone: "p0_ops_vault_blocked",
      goDecision: "NO-GO",
      competitorMatrixPassed: false,
      channelLiveHonest: false,
    });
    expect(gates).toHaveLength(7);
    expect(gates.find((g) => g.id === "production_ga")?.complete).toBe(false);
  });

  it("track completion requires blocking tracks only", () => {
    const incomplete = buildCompleteTracks({ competitorAligned: false });
    expect(resolveSeriesAPartnerExpansionComplete(incomplete)).toBe(false);
    const complete = buildCompleteTracks();
    expect(resolveSeriesAPartnerExpansionComplete(complete)).toBe(true);
  });
});

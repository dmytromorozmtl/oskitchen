import { describe, expect, it } from "vitest";

import {
  buildSeriesAPartnerExpansionPostScaleOrchestratorSummary,
  buildSeriesAPartnerExpansionReadinessChecklistMarkdown,
  resolveSeriesAPartnerExpansionMilestone,
  resolveSeriesAPartnerExpansionMilestoneFromPhaseStatuses,
} from "@/lib/commercial/series-a-partner-expansion-post-scale-orchestrator-era21";
import {
  buildSeriesAPartnerExpansionPhaseStatuses,
  resolveSeriesAPartnerExpansionPrerequisites,
} from "@/lib/commercial/series-a-partner-expansion-phases-era21";
import { evaluateSeriesAPartnerExpansionEnv } from "@/scripts/ops/validate-series-a-partner-expansion-env";

describe("series-a-partner-expansion-post-scale-orchestrator-era21", () => {
  it("blocks when Scale not complete", () => {
    const evaluation = evaluateSeriesAPartnerExpansionEnv({});
    expect(evaluation.seriesAMilestone).toBe("scale_blocked");
    expect(evaluation.prerequisites.prerequisitesComplete).toBe(false);
  });

  it("resolves track A when Scale complete but Series A env empty", () => {
    const prerequisites = resolveSeriesAPartnerExpansionPrerequisites({
      goDecision: "GO",
      scaleComplete: true,
    });
    const phases = buildSeriesAPartnerExpansionPhaseStatuses({
      prerequisites,
      goNoGoSummary: { decision: "GO" } as never,
      p0Staging: null,
      tier2Summary: null,
      metricsBaseline: { overall: "PASSED", metrics: [] } as never,
      caseStudyDraft: { caseStudyProofStatus: "internal_draft_ready" } as never,
      investorOnepager: {
        overall: "PASSED",
        narrativeProofStatus: "proof_ready_with_metrics",
      } as never,
      competitorMatrix: null,
      env: { SCALE_DATA_ROOM_INDEX_PUBLISHED: "1" },
    });
    const milestone = resolveSeriesAPartnerExpansionMilestone({
      prerequisitesComplete: true,
      scaleComplete: true,
      seriesAComplete: false,
      phases,
    });
    expect(milestone).toBe("track_a_series_a_data_room");
  });

  it("builds orchestrator summary with Scale redirect when blocked", () => {
    const evaluation = evaluateSeriesAPartnerExpansionEnv({});
    const summary = buildSeriesAPartnerExpansionPostScaleOrchestratorSummary({
      evaluation,
      artifacts: {
        goNoGoPresent: true,
        p0StagingPresent: false,
        tier2Present: false,
        metricsBaselinePresent: false,
        caseStudyDraftPresent: false,
        investorOnepagerPresent: false,
        competitorMatrixPresent: false,
      },
    });
    expect(summary.milestone).toBe("scale_blocked");
    expect(summary.recommendedCommands[0]).toContain("scale-readiness-post-month2-orchestrator");
  });

  it("builds readiness checklist markdown", () => {
    const evaluation = evaluateSeriesAPartnerExpansionEnv({});
    const summary = buildSeriesAPartnerExpansionPostScaleOrchestratorSummary({
      evaluation,
      artifacts: {
        goNoGoPresent: true,
        p0StagingPresent: false,
        tier2Present: false,
        metricsBaselinePresent: false,
        caseStudyDraftPresent: false,
        investorOnepagerPresent: false,
        competitorMatrixPresent: false,
      },
    });
    const markdown = buildSeriesAPartnerExpansionReadinessChecklistMarkdown({ summary, evaluation });
    expect(markdown).toContain("Series A / Partner Expansion — Readiness Checklist");
    expect(markdown).toContain("series-a-partner-expansion");
  });

  it("resolves milestone from phase statuses for UI", () => {
    const milestone = resolveSeriesAPartnerExpansionMilestoneFromPhaseStatuses(
      [
        { id: "track_a_series_a_data_room", complete: true, optional: false },
        { id: "track_b_partner_channel_expansion", complete: false, optional: false },
        { id: "track_c_multi_region_playbook", complete: false, optional: false },
      ],
      { prerequisitesComplete: true, scaleComplete: true, seriesAComplete: false },
    );
    expect(milestone).toBe("track_b_partner_channel_expansion");
  });
});

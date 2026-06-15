import { describe, expect, it } from "vitest";

import {
  buildMarketLeaderPositioningPostSeriesAOrchestratorSummary,
  buildMarketLeaderPositioningReadinessChecklistMarkdown,
  resolveMarketLeaderPositioningMilestone,
  resolveMarketLeaderPositioningMilestoneFromPhaseStatuses,
} from "@/lib/commercial/market-leader-positioning-post-series-a-orchestrator-era21";
import {
  buildMarketLeaderPositioningPhaseStatuses,
  resolveMarketLeaderPositioningPrerequisites,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import { evaluateMarketLeaderPositioningEnv } from "@/scripts/ops/validate-market-leader-positioning-env";

describe("market-leader-positioning-post-series-a-orchestrator-era21", () => {
  it("blocks when Series A not complete", () => {
    const evaluation = evaluateMarketLeaderPositioningEnv({});
    expect(evaluation.marketLeaderMilestone).toBe("series_a_blocked");
    expect(evaluation.prerequisites.prerequisitesComplete).toBe(false);
  });

  it("resolves pillar1 when Series A complete but market leader env empty", () => {
    const prerequisites = resolveMarketLeaderPositioningPrerequisites({
      goDecision: "GO",
      seriesAComplete: true,
    });
    const phases = buildMarketLeaderPositioningPhaseStatuses({
      prerequisites,
      goNoGoSummary: { decision: "GO", customerName: "Acme" } as never,
      p0Staging: null,
      tier2Summary: null,
      metricsBaseline: { overall: "PASSED" } as never,
      caseStudyDraft: null,
      investorOnepager: null,
      rollbackDrill: null,
      competitorMatrix: null,
      env: {},
    });
    const milestone = resolveMarketLeaderPositioningMilestone({
      prerequisitesComplete: true,
      seriesAComplete: true,
      marketLeaderComplete: false,
      phases,
    });
    expect(milestone).toBe("pillar1_category_narrative");
  });

  it("builds orchestrator summary with Series A redirect when blocked", () => {
    const evaluation = evaluateMarketLeaderPositioningEnv({});
    const summary = buildMarketLeaderPositioningPostSeriesAOrchestratorSummary({
      evaluation,
      artifacts: {
        goNoGoPresent: true,
        p0StagingPresent: false,
        tier2Present: false,
        metricsBaselinePresent: false,
        caseStudyDraftPresent: false,
        investorOnepagerPresent: false,
        rollbackDrillPresent: false,
        competitorMatrixPresent: false,
      },
    });
    expect(summary.milestone).toBe("series_a_blocked");
    expect(summary.recommendedCommands[0]).toContain(
      "series-a-partner-expansion-post-scale-orchestrator",
    );
  });

  it("builds readiness checklist markdown", () => {
    const evaluation = evaluateMarketLeaderPositioningEnv({});
    const summary = buildMarketLeaderPositioningPostSeriesAOrchestratorSummary({
      evaluation,
      artifacts: {
        goNoGoPresent: true,
        p0StagingPresent: false,
        tier2Present: false,
        metricsBaselinePresent: false,
        caseStudyDraftPresent: false,
        investorOnepagerPresent: false,
        rollbackDrillPresent: false,
        competitorMatrixPresent: false,
      },
    });
    const markdown = buildMarketLeaderPositioningReadinessChecklistMarkdown({ summary, evaluation });
    expect(markdown).toContain("Market Leader Positioning — Readiness Checklist");
    expect(markdown).toContain("market-leader-positioning");
  });

  it("resolves milestone from phase statuses for UI", () => {
    const milestone = resolveMarketLeaderPositioningMilestoneFromPhaseStatuses(
      [
        { id: "pillar1_category_narrative", complete: true, optional: false },
        { id: "pillar2_competitive_moat_proof", complete: false, optional: false },
        { id: "pillar3_analyst_press_kit", complete: false, optional: false },
      ],
      { prerequisitesComplete: true, seriesAComplete: true, marketLeaderComplete: false },
    );
    expect(milestone).toBe("pillar2_competitive_moat_proof");
  });
});

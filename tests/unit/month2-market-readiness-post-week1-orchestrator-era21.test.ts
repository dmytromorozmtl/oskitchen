import { describe, expect, it } from "vitest";

import {
  buildMonth2MarketReadinessPostWeek1OrchestratorSummary,
  buildMonth2MarketReadinessReadinessChecklistMarkdown,
  resolveMonth2MarketReadinessMilestone,
  resolveMonth2MarketReadinessMilestoneFromPhaseStatuses,
} from "@/lib/commercial/month2-market-readiness-post-week1-orchestrator-era21";
import {
  buildMonth2MarketReadinessPhaseStatuses,
  resolveMonth2MarketReadinessPrerequisites,
} from "@/lib/commercial/month2-market-readiness-phases-era21";
import { evaluateMonth2MarketReadinessEnv } from "@/scripts/ops/validate-month2-market-readiness-env";

describe("month2-market-readiness-post-week1-orchestrator-era21", () => {
  it("blocks when Week 1 not complete", () => {
    const evaluation = evaluateMonth2MarketReadinessEnv({});
    expect(evaluation.month2Milestone).toBe("week1_blocked");
    expect(evaluation.prerequisites.prerequisitesComplete).toBe(false);
  });

  it("resolves workstream A when Week 1 complete but Month 2 env empty", () => {
    const prerequisites = resolveMonth2MarketReadinessPrerequisites({
      goDecision: "GO",
      week1Complete: true,
    });
    const phases = buildMonth2MarketReadinessPhaseStatuses({
      prerequisites,
      goNoGoSummary: { decision: "GO" } as never,
      metricsBaseline: { overall: "PASSED" } as never,
      caseStudyDraft: { caseStudyProofStatus: "internal_draft_ready" } as never,
      investorOnepager: null,
      env: {},
    });
    const milestone = resolveMonth2MarketReadinessMilestone({
      prerequisitesComplete: true,
      week1Complete: true,
      month2Complete: false,
      phases,
    });
    expect(milestone).toBe("workstream_a_investor_onepager");
  });

  it("builds orchestrator summary with Week 1 redirect when blocked", () => {
    const evaluation = evaluateMonth2MarketReadinessEnv({});
    const summary = buildMonth2MarketReadinessPostWeek1OrchestratorSummary({
      evaluation,
      artifacts: {
        goNoGoPresent: true,
        metricsBaselinePresent: false,
        caseStudyDraftPresent: false,
        investorOnepagerPresent: false,
      },
    });
    expect(summary.milestone).toBe("week1_blocked");
    expect(summary.recommendedCommands[0]).toContain("pilot-week1-execution-post-go-orchestrator");
  });

  it("builds readiness checklist markdown", () => {
    const evaluation = evaluateMonth2MarketReadinessEnv({});
    const summary = buildMonth2MarketReadinessPostWeek1OrchestratorSummary({
      evaluation,
      artifacts: {
        goNoGoPresent: true,
        metricsBaselinePresent: false,
        caseStudyDraftPresent: false,
        investorOnepagerPresent: false,
      },
    });
    const markdown = buildMonth2MarketReadinessReadinessChecklistMarkdown({ summary, evaluation });
    expect(markdown).toContain("Month 2 Market Readiness — Readiness Checklist");
    expect(markdown).toContain("ghost-kitchens");
  });

  it("resolves milestone from phase statuses for UI", () => {
    const milestone = resolveMonth2MarketReadinessMilestoneFromPhaseStatuses(
      [
        { id: "workstream_a_investor_onepager", complete: true, optional: false },
        { id: "workstream_b_gtm_icp_landings", complete: false, optional: false },
        { id: "workstream_d_case_study_publish", complete: false, optional: false },
      ],
      { prerequisitesComplete: true, week1Complete: true, month2Complete: false },
    );
    expect(milestone).toBe("workstream_b_gtm_icp_landings");
  });
});

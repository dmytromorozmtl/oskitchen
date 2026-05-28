import { describe, expect, it } from "vitest";

import {
  buildScaleReadinessPostMonth2OrchestratorSummary,
  buildScaleReadinessReadinessChecklistMarkdown,
  resolveScaleReadinessMilestone,
  resolveScaleReadinessMilestoneFromPhaseStatuses,
} from "@/lib/commercial/scale-readiness-post-month2-orchestrator-era21";
import {
  buildScaleReadinessPhaseStatuses,
  resolveScaleReadinessPrerequisites,
} from "@/lib/commercial/scale-readiness-phases-era21";
import { evaluateScaleReadinessEnv } from "@/scripts/ops/validate-scale-readiness-env";

describe("scale-readiness-post-month2-orchestrator-era21", () => {
  it("blocks when Month 2 not complete", () => {
    const evaluation = evaluateScaleReadinessEnv({});
    expect(evaluation.scaleMilestone).toBe("month2_blocked");
    expect(evaluation.prerequisites.prerequisitesComplete).toBe(false);
  });

  it("resolves gate1 when Month 2 complete but scale env empty", () => {
    const prerequisites = resolveScaleReadinessPrerequisites({
      goDecision: "GO",
      month2Complete: true,
    });
    const phases = buildScaleReadinessPhaseStatuses({
      prerequisites,
      goNoGoSummary: { decision: "GO", customerName: "Acme" } as never,
      p0Staging: null,
      tier2Summary: null,
      metricsBaseline: null,
      caseStudyDraft: null,
      investorOnepager: null,
      rollbackDrill: null,
      env: {},
    });
    const milestone = resolveScaleReadinessMilestone({
      prerequisitesComplete: true,
      month2Complete: true,
      scaleComplete: false,
      phases,
    });
    expect(milestone).toBe("gate1_per_customer_pilot_ops");
  });

  it("builds orchestrator summary with Month 2 redirect when blocked", () => {
    const evaluation = evaluateScaleReadinessEnv({});
    const summary = buildScaleReadinessPostMonth2OrchestratorSummary({
      evaluation,
      artifacts: {
        goNoGoPresent: true,
        p0StagingPresent: false,
        tier2Present: false,
        metricsBaselinePresent: false,
        caseStudyDraftPresent: false,
        investorOnepagerPresent: false,
        rollbackDrillPresent: false,
      },
    });
    expect(summary.milestone).toBe("month2_blocked");
    expect(summary.recommendedCommands[0]).toContain(
      "month2-market-readiness-post-week1-orchestrator",
    );
  });

  it("builds readiness checklist markdown", () => {
    const evaluation = evaluateScaleReadinessEnv({});
    const summary = buildScaleReadinessPostMonth2OrchestratorSummary({
      evaluation,
      artifacts: {
        goNoGoPresent: true,
        p0StagingPresent: false,
        tier2Present: false,
        metricsBaselinePresent: false,
        caseStudyDraftPresent: false,
        investorOnepagerPresent: false,
        rollbackDrillPresent: false,
      },
    });
    const markdown = buildScaleReadinessReadinessChecklistMarkdown({ summary, evaluation });
    expect(markdown).toContain("Scale Readiness — Readiness Checklist");
    expect(markdown).toContain("scale-readiness");
  });

  it("resolves milestone from phase statuses for UI", () => {
    const milestone = resolveScaleReadinessMilestoneFromPhaseStatuses(
      [
        { id: "gate1_per_customer_pilot_ops", complete: true, optional: false },
        { id: "gate2_soc2_readiness_track", complete: false, optional: false },
        { id: "gate3_enterprise_sso_production", complete: false, optional: false },
      ],
      { prerequisitesComplete: true, month2Complete: true, scaleComplete: false },
    );
    expect(milestone).toBe("gate2_soc2_readiness_track");
  });
});

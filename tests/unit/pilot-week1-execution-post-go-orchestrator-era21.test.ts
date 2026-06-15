import { describe, expect, it } from "vitest";

import {
  buildPilotWeek1PostGoOrchestratorSummary,
  buildPilotWeek1ReadinessChecklistMarkdown,
  resolvePilotWeek1ExecutionMilestone,
  resolvePilotWeek1ExecutionMilestoneFromPhaseStatuses,
} from "@/lib/commercial/pilot-week1-execution-post-go-orchestrator-era21";
import {
  buildPilotWeek1ExecutionPhaseStatuses,
  resolvePilotWeek1ExecutionPrerequisites,
} from "@/lib/commercial/pilot-week1-execution-phases-era21";
import { evaluatePilotWeek1Env } from "@/scripts/ops/validate-pilot-week1-env";

describe("pilot-week1-execution-post-go-orchestrator-era21", () => {
  it("blocks when GO decision not present", () => {
    const evaluation = evaluatePilotWeek1Env({});
    expect(evaluation.week1Milestone).toBe("go_blocked");
    expect(evaluation.prerequisites.prerequisitesComplete).toBe(false);
  });

  it("resolves day1 when GO but no env vars", () => {
    const prerequisites = resolvePilotWeek1ExecutionPrerequisites({ goDecision: "GO" });
    const phases = buildPilotWeek1ExecutionPhaseStatuses({
      prerequisites,
      goNoGoSummary: { decision: "GO" } as never,
      metricsBaseline: null,
      caseStudyDraft: null,
      env: {},
    });
    const milestone = resolvePilotWeek1ExecutionMilestone({
      prerequisitesComplete: true,
      week1Complete: false,
      phases,
    });
    expect(milestone).toBe("day1_ttv_onboarding");
  });

  it("builds orchestrator summary with GO closure redirect when blocked", () => {
    const evaluation = evaluatePilotWeek1Env({});
    const summary = buildPilotWeek1PostGoOrchestratorSummary({
      evaluation,
      artifacts: {
        goNoGoPresent: true,
        metricsBaselinePresent: false,
        caseStudyDraftPresent: false,
      },
    });
    expect(summary.milestone).toBe("go_blocked");
    expect(summary.recommendedCommands[0]).toContain("commercial-go-closure-post-tier2-orchestrator");
  });

  it("builds readiness checklist markdown", () => {
    const evaluation = evaluatePilotWeek1Env({});
    const summary = buildPilotWeek1PostGoOrchestratorSummary({
      evaluation,
      artifacts: {
        goNoGoPresent: true,
        metricsBaselinePresent: false,
        caseStudyDraftPresent: false,
      },
    });
    const markdown = buildPilotWeek1ReadinessChecklistMarkdown({ summary, evaluation });
    expect(markdown).toContain("Pilot Week 1 — Readiness Checklist");
    expect(markdown).toContain("launch-wizard");
  });

  it("resolves milestone from phase statuses for UI", () => {
    const milestone = resolvePilotWeek1ExecutionMilestoneFromPhaseStatuses(
      [
        { id: "day1_ttv_onboarding", complete: true },
        { id: "day2_integration_health", complete: false },
        { id: "day3_pos_money_path", complete: false },
        { id: "day4_reports_review", complete: false },
        { id: "day5_metrics_narrative", complete: false },
      ],
      { prerequisitesComplete: true, week1Complete: false },
    );
    expect(milestone).toBe("day2_integration_health");
  });
});

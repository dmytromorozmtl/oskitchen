import { describe, expect, it } from "vitest";

import {
  buildContinuousImprovementLoopOrchestratorReportMarkdown,
  buildContinuousImprovementLoopPostSustainedOpsOrchestratorSummary,
  resolveContinuousImprovementLoopMilestone,
  resolveContinuousImprovementLoopMilestoneFromTrackStatuses,
} from "@/lib/commercial/continuous-improvement-loop-post-sustained-ops-orchestrator-era22";
import { buildContinuousImprovementLoopTrackStatuses } from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import { evaluateContinuousImprovementLoop } from "@/scripts/ops/validate-continuous-improvement-loop";

describe("continuous-improvement-loop-post-sustained-ops-orchestrator-era22", () => {
  it("blocks when sustained ops is not complete", () => {
    const evaluation = evaluateContinuousImprovementLoop({});
    expect(evaluation.improvementLoopMilestone).toBe("sustained_ops_blocked");
    expect(evaluation.pureOperationalMode).toBe(false);
  });

  it("resolves loop_all_healthy when artifact tracks are fresh", () => {
    const tracks = buildContinuousImprovementLoopTrackStatuses({
      p0Staging: {
        runAt: new Date().toISOString(),
        children: { channelLive: { overall: "PASSED" } },
        p0ProofStatus: "proof_passed",
      } as never,
      tier2Summary: { tier2ProofStatus: "proof_passed", runAt: new Date().toISOString() } as never,
      metricsBaseline: {
        overall: "PASSED",
        runAt: new Date().toISOString(),
        capturedAt: new Date().toISOString(),
      } as never,
      competitorMatrix: {
        overall: "PASSED",
        matrixProofStatus: "evidence_aligned_era17",
        runAt: new Date().toISOString(),
      } as never,
      customerName: "Acme",
    });
    const milestone = resolveContinuousImprovementLoopMilestone({
      pureOperationalMode: true,
      tracks,
    });
    expect(milestone).toBe("loop_all_healthy");
  });

  it("builds orchestrator summary with Step 9 redirect when blocked", () => {
    const evaluation = evaluateContinuousImprovementLoop({});
    const summary = buildContinuousImprovementLoopPostSustainedOpsOrchestratorSummary({
      evaluation,
      artifacts: {
        goNoGoPresent: true,
        p0StagingPresent: false,
        tier2Present: false,
        metricsBaselinePresent: false,
        competitorMatrixPresent: false,
      },
    });
    expect(summary.milestone).toBe("sustained_ops_blocked");
    expect(summary.recommendedCommands[0]).toContain(
      "sustained-operational-excellence-post-market-leader-orchestrator",
    );
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluateContinuousImprovementLoop({});
    const summary = buildContinuousImprovementLoopPostSustainedOpsOrchestratorSummary({
      evaluation,
      artifacts: {
        goNoGoPresent: true,
        p0StagingPresent: false,
        tier2Present: false,
        metricsBaselinePresent: false,
        competitorMatrixPresent: false,
      },
    });
    const markdown = buildContinuousImprovementLoopOrchestratorReportMarkdown({
      summary,
      evaluation,
    });
    expect(markdown).toContain("Continuous Improvement Loop — Orchestrator Report");
    expect(markdown).toContain("continuous-improvement-loop");
  });

  it("resolves milestone from track statuses for UI", () => {
    const milestone = resolveContinuousImprovementLoopMilestoneFromTrackStatuses(
      [
        { id: "weekly_integration", status: "overdue" },
        { id: "monthly_metrics", status: "healthy" },
      ],
      { pureOperationalMode: true },
    );
    expect(milestone).toBe("attention_weekly_integration");
  });
});

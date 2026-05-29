import { describe, expect, it } from "vitest";

import {
  buildPaidPilotGoConvergenceEra25OrchestratorReportMarkdown,
  buildPaidPilotGoConvergenceEra25OrchestratorSummary,
  resolvePaidPilotGoConvergenceEra25Milestone,
} from "@/lib/commercial/paid-pilot-go-convergence-post-breakthrough-orchestrator-era25";
import { evaluatePaidPilotGoConvergenceEra25 } from "@/lib/commercial/evaluate-paid-pilot-go-convergence-era25";

describe("paid-pilot-go-convergence-post-breakthrough-orchestrator-era25", () => {
  it("blocks when breakthrough is not ready", () => {
    const milestone = resolvePaidPilotGoConvergenceEra25Milestone({
      ownerDailyBriefingBreakthroughEra25Milestone: "blueprint_regression_blocked",
      icpQualified: true,
      loiRecorded: true,
      forbiddenClaimsPassed: true,
      kickoffChecklistPresent: true,
      goDecision: "GO",
    });
    expect(milestone).toBe("breakthrough_regression_blocked");
  });

  it("resolves paid_pilot_go_convergence_era25_ready when all gates pass", () => {
    const milestone = resolvePaidPilotGoConvergenceEra25Milestone({
      ownerDailyBriefingBreakthroughEra25Milestone: "owner_daily_briefing_breakthrough_era25_ready",
      icpQualified: true,
      loiRecorded: true,
      forbiddenClaimsPassed: true,
      kickoffChecklistPresent: true,
      goDecision: "GO",
    });
    expect(milestone).toBe("paid_pilot_go_convergence_era25_ready");
  });

  it("builds orchestrator summary with breakthrough redirect when blocked", () => {
    const evaluation = evaluatePaidPilotGoConvergenceEra25({}, "/nonexistent-root-for-test");
    const summary = buildPaidPilotGoConvergenceEra25OrchestratorSummary({
      evaluation,
      artifacts: { convergenceReportPresent: false },
    });
    expect(summary.milestone).toBe("breakthrough_regression_blocked");
    expect(summary.recommendedCommands[0]).toContain(
      "owner-daily-briefing-breakthrough-post-gates-orchestrator",
    );
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluatePaidPilotGoConvergenceEra25({}, "/nonexistent-root-for-test");
    const summary = buildPaidPilotGoConvergenceEra25OrchestratorSummary({
      evaluation,
      artifacts: { convergenceReportPresent: false },
    });
    const markdown = buildPaidPilotGoConvergenceEra25OrchestratorReportMarkdown({
      summary,
      evaluation,
    });
    expect(markdown).toContain("era25 Paid Pilot GO Convergence — Orchestrator Report");
    expect(markdown).toContain("#era25-paid-pilot-go-convergence");
  });
});

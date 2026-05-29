import { describe, expect, it } from "vitest";

import {
  buildPilotWeek1ExecutionConvergenceEra25OrchestratorReportMarkdown,
  buildPilotWeek1ExecutionConvergenceEra25OrchestratorSummary,
  resolvePilotWeek1ExecutionConvergenceEra25Milestone,
} from "@/lib/commercial/pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25";
import { evaluatePilotWeek1ExecutionConvergenceEra25 } from "@/lib/commercial/evaluate-pilot-week1-execution-convergence-era25";

describe("pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25", () => {
  it("blocks when go convergence is not ready", () => {
    const milestone = resolvePilotWeek1ExecutionConvergenceEra25Milestone({
      paidPilotGoConvergenceEra25Milestone: "breakthrough_regression_blocked",
      week1Complete: false,
      nextPhaseId: "day1_ttv_onboarding",
    });
    expect(milestone).toBe("go_convergence_regression_blocked");
  });

  it("resolves pilot_week1_execution_convergence_era25_ready when complete", () => {
    const milestone = resolvePilotWeek1ExecutionConvergenceEra25Milestone({
      paidPilotGoConvergenceEra25Milestone: "paid_pilot_go_convergence_era25_ready",
      week1Complete: true,
      nextPhaseId: null,
    });
    expect(milestone).toBe("pilot_week1_execution_convergence_era25_ready");
  });

  it("builds orchestrator summary with go convergence redirect when blocked", () => {
    const evaluation = evaluatePilotWeek1ExecutionConvergenceEra25({});
    const summary = buildPilotWeek1ExecutionConvergenceEra25OrchestratorSummary({
      evaluation,
      artifacts: { convergenceReportPresent: false },
    });
    expect(summary.milestone).toBe("go_convergence_regression_blocked");
    expect(summary.recommendedCommands[0]).toContain("paid-pilot-go-convergence");
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluatePilotWeek1ExecutionConvergenceEra25({});
    const summary = buildPilotWeek1ExecutionConvergenceEra25OrchestratorSummary({
      evaluation,
      artifacts: { convergenceReportPresent: false },
    });
    const markdown = buildPilotWeek1ExecutionConvergenceEra25OrchestratorReportMarkdown({
      summary,
      evaluation,
    });
    expect(markdown).toContain("era25 Pilot Week 1 Execution Convergence — Orchestrator Report");
    expect(markdown).toContain("#era25-pilot-week1-execution-convergence");
  });
});

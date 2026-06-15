import { describe, expect, it } from "vitest";

import { buildPilotWeek1ExecutionConvergenceEra25ReportMarkdown } from "../../scripts/ops/sync-pilot-week1-execution-convergence-era25-report";
import { evaluatePilotWeek1ExecutionConvergenceEra25WithMilestones } from "../../scripts/ops/validate-pilot-week1-execution-convergence-era25";

describe("validate-pilot-week1-execution-convergence-era25", () => {
  it("evaluates convergence with milestones and smoke flags", () => {
    const result = evaluatePilotWeek1ExecutionConvergenceEra25WithMilestones({});
    expect(result.pilotWeek1ExecutionConvergenceEra25Milestone).toBe(
      "go_convergence_regression_blocked",
    );
    expect(result.evaluation.convergenceBlocked).toBe(true);
    expect(result.readyForGoConvergenceRegressionSmokes).toBe(true);
  });

  it("builds convergence report markdown", () => {
    const result = evaluatePilotWeek1ExecutionConvergenceEra25WithMilestones({});
    const markdown = buildPilotWeek1ExecutionConvergenceEra25ReportMarkdown(result);
    expect(markdown).toContain("era25 Pilot Week 1 Execution Convergence Report");
    expect(markdown).toContain("go_convergence_regression_blocked");
  });
});

import { describe, expect, it } from "vitest";

import {
  buildPostTerminusSteadyStateOrchestratorReportMarkdown,
  buildPostTerminusSteadyStatePostEngineeringTerminusOrchestratorSummary,
  resolvePostTerminusSteadyStateMilestone,
  resolvePostTerminusSteadyStateMilestoneFromTrackStatuses,
} from "@/lib/commercial/post-terminus-steady-state-post-engineering-terminus-orchestrator-era24";
import { buildSteadyStateTrackStatuses } from "@/lib/commercial/post-terminus-steady-state-phases-era24";
import { evaluateSteadyStateOperatorLoop } from "@/lib/commercial/evaluate-steady-state-operator-loop";
import { evaluateCommercialPilotPathWithMilestones } from "@/scripts/ops/validate-commercial-pilot-path";
import { evaluateSteadyStateOperatorLoopWithMilestones } from "@/scripts/ops/validate-steady-state-operator-loop";

describe("post-terminus-steady-state-post-engineering-terminus-orchestrator-era24", () => {
  it("blocks with era25 prerequisite when engineering path is not past era25 gate", () => {
    const result = evaluateSteadyStateOperatorLoopWithMilestones({});
    expect(result.steadyStateMilestone).toBe("era25_sustained_ops_convergence_blocked");
    expect(result.evaluation.steadyStateActive).toBe(false);
    expect(result.pathEvaluation.engineeringPathTerminusMilestone).toBe(
      "era25_sustained_ops_convergence_blocked",
    );
  });

  it("resolves steady_state_healthy when measurable tracks are fresh", () => {
    const tracks = buildSteadyStateTrackStatuses({
      maintenanceOverdue: 0,
      maintenanceDueSoon: 0,
      improvementOverdue: 0,
      improvementDueSoon: 0,
      productEvolutionOverdue: 0,
      productEvolutionDueSoon: 0,
    });
    const milestone = resolvePostTerminusSteadyStateMilestone({
      steadyStateActive: true,
      engineeringPathTerminusMilestone: "engineering_path_terminus_healthy",
      tracks,
    });
    expect(milestone).toBe("steady_state_healthy");
  });

  it("resolves attention_maintenance_rhythm when weekly maintenance is overdue", () => {
    const milestone = resolvePostTerminusSteadyStateMilestoneFromTrackStatuses(
      [{ id: "weekly_maintenance", status: "overdue" }],
      {
        steadyStateActive: true,
        engineeringPathTerminusMilestone: "engineering_path_terminus_healthy",
      },
    );
    expect(milestone).toBe("attention_maintenance_rhythm");
  });

  it("resolves attention_upstream_loop when improvement track is overdue", () => {
    const milestone = resolvePostTerminusSteadyStateMilestoneFromTrackStatuses(
      [{ id: "weekly_improvement_loop", status: "overdue" }],
      {
        steadyStateActive: true,
        engineeringPathTerminusMilestone: "engineering_path_terminus_healthy",
      },
    );
    expect(milestone).toBe("attention_upstream_loop");
  });

  it("builds orchestrator summary with era25 redirect when prerequisite blocked", () => {
    const evaluation = evaluateSteadyStateOperatorLoop({});
    const pathEvaluation = evaluateCommercialPilotPathWithMilestones({});
    const summary = buildPostTerminusSteadyStatePostEngineeringTerminusOrchestratorSummary({
      evaluation,
      engineeringPathTerminusMilestone: pathEvaluation.engineeringPathTerminusMilestone,
      artifacts: { steadyStateReportPresent: false },
    });
    expect(summary.milestone).toBe("era25_sustained_ops_convergence_blocked");
    expect(summary.recommendedCommands[0]).toContain(
      "sustained-operational-excellence-convergence-era25",
    );
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluateSteadyStateOperatorLoop({});
    const pathEvaluation = evaluateCommercialPilotPathWithMilestones({});
    const summary = buildPostTerminusSteadyStatePostEngineeringTerminusOrchestratorSummary({
      evaluation,
      engineeringPathTerminusMilestone: pathEvaluation.engineeringPathTerminusMilestone,
      artifacts: { steadyStateReportPresent: false },
    });
    const markdown = buildPostTerminusSteadyStateOrchestratorReportMarkdown({
      summary,
      evaluation,
    });
    expect(markdown).toContain("Post-Terminus Steady State — Orchestrator Report");
    expect(markdown).toContain("#post-terminus-steady-state");
  });
});

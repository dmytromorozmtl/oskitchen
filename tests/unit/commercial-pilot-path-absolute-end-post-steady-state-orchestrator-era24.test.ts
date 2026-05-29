import { describe, expect, it } from "vitest";

import {
  buildCommercialPilotPathAbsoluteEndOrchestratorReportMarkdown,
  buildCommercialPilotPathAbsoluteEndPostSteadyStateOrchestratorSummary,
  resolveCommercialPilotPathAbsoluteEndMilestone,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-post-steady-state-orchestrator-era24";
import { evaluateCommercialPilotPathAbsoluteEnd } from "@/lib/commercial/evaluate-commercial-pilot-path-absolute-end";
import { evaluateCommercialPilotPathAbsoluteEndWithMilestones } from "@/scripts/ops/validate-commercial-pilot-path-absolute-end";
import { evaluateSteadyStateOperatorLoopWithMilestones } from "@/scripts/ops/validate-steady-state-operator-loop";

describe("commercial-pilot-path-absolute-end-post-steady-state-orchestrator-era24", () => {
  it("blocks when steady state is not healthy", () => {
    const result = evaluateCommercialPilotPathAbsoluteEndWithMilestones({});
    expect(result.absoluteEndMilestone).toBe("steady_state_blocked");
    expect(result.evaluation.absoluteEndActive).toBe(false);
  });

  it("resolves attention_path_closure when gate chain blocked", () => {
    const evaluation = evaluateCommercialPilotPathAbsoluteEnd({});
    const milestone = resolveCommercialPilotPathAbsoluteEndMilestone({
      absoluteEndActive: true,
      steadyStateMilestone: "steady_state_healthy",
      firstBlockedStep: evaluation.path.summary.firstBlockedStep,
      firstBlockedGateStep: evaluation.path.summary.firstBlockedGateStep,
    });
    expect(milestone).toBe("attention_path_closure");
  });

  it("resolves absolute_end_healthy when path catalog is complete", () => {
    const milestone = resolveCommercialPilotPathAbsoluteEndMilestone({
      absoluteEndActive: true,
      steadyStateMilestone: "steady_state_healthy",
      firstBlockedStep: null,
      firstBlockedGateStep: null,
    });
    expect(milestone).toBe("absolute_end_healthy");
  });

  it("builds orchestrator summary with Step 14 redirect when blocked", () => {
    const evaluation = evaluateCommercialPilotPathAbsoluteEnd({});
    const steadyState = evaluateSteadyStateOperatorLoopWithMilestones({});
    const summary = buildCommercialPilotPathAbsoluteEndPostSteadyStateOrchestratorSummary({
      evaluation,
      steadyStateMilestone: steadyState.steadyStateMilestone,
      artifacts: { absoluteEndReportPresent: false },
    });
    expect(summary.milestone).toBe("steady_state_blocked");
    expect(summary.recommendedCommands[0]).toContain(
      "post-terminus-steady-state-post-engineering-terminus-orchestrator",
    );
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluateCommercialPilotPathAbsoluteEnd({});
    const steadyState = evaluateSteadyStateOperatorLoopWithMilestones({});
    const summary = buildCommercialPilotPathAbsoluteEndPostSteadyStateOrchestratorSummary({
      evaluation,
      steadyStateMilestone: steadyState.steadyStateMilestone,
      artifacts: { absoluteEndReportPresent: false },
    });
    const markdown = buildCommercialPilotPathAbsoluteEndOrchestratorReportMarkdown({
      summary,
      evaluation,
    });
    expect(markdown).toContain("Commercial Pilot Path Absolute End — Orchestrator Report");
    expect(markdown).toContain("#commercial-pilot-path-absolute-end");
  });
});

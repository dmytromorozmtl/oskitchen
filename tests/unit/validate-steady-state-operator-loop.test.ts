import { describe, expect, it } from "vitest";

import { evaluateSteadyStateOperatorLoop } from "@/lib/commercial/evaluate-steady-state-operator-loop";
import { buildSteadyStateOperatorLoopReportMarkdown } from "../../scripts/ops/sync-steady-state-operator-loop-report";
import { buildEraCharterReadinessChecklistMarkdown } from "../../scripts/ops/export-era-charter-readiness-checklist";
import { evaluateSteadyStateOperatorLoopWithMilestones } from "../../scripts/ops/validate-steady-state-operator-loop";

describe("validate-steady-state-operator-loop", () => {
  it("evaluates without throwing", () => {
    expect(() => evaluateSteadyStateOperatorLoop({})).not.toThrow();
    expect(() => evaluateSteadyStateOperatorLoopWithMilestones({})).not.toThrow();
  });

  it("reports honest not-in-steady-state locally", () => {
    const result = evaluateSteadyStateOperatorLoopWithMilestones({});
    expect(result.evaluation.steadyStateActive).toBe(false);
    expect(result.steadyStateMilestone).toBe("era25_sustained_ops_convergence_blocked");
    expect(result.readyForMaintenanceRhythmSmokes).toBe(false);
    expect(result.readyForUpstreamLoopSmokes).toBe(false);
    expect(result.evaluation.tracks).toHaveLength(6);
  });

  it("builds steady-state report markdown", () => {
    const result = evaluateSteadyStateOperatorLoopWithMilestones({});
    const markdown = buildSteadyStateOperatorLoopReportMarkdown(result);
    expect(markdown).toContain("Steady-State Operator Loop");
    expect(markdown).toContain("Steady state milestone");
    expect(markdown).toContain("test:ci:commercial-pilot-runbook:cert");
  });

  it("exports era charter readiness checklist", () => {
    const markdown = buildEraCharterReadinessChecklistMarkdown();
    expect(markdown).toContain("Era Charter Readiness Checklist");
    expect(markdown).toContain("era25");
  });
});

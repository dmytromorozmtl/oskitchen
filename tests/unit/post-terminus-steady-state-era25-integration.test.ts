import { describe, expect, it } from "vitest";

import {
  POST_TERMINUS_STEADY_STATE_BLOCKED_MILESTONES,
  resolvePostTerminusSteadyStateMilestone,
} from "@/lib/commercial/post-terminus-steady-state-post-engineering-terminus-orchestrator-era24";
import { evaluateSteadyStateOperatorLoopWithMilestones } from "@/scripts/ops/validate-steady-state-operator-loop";

describe("post-terminus-steady-state-era25-integration", () => {
  it("surfaces engineering path prerequisite milestones before engineering_terminus_blocked", () => {
    expect(
      resolvePostTerminusSteadyStateMilestone({
        steadyStateActive: false,
        engineeringPathTerminusMilestone: "product_evolution_blocked",
        tracks: [],
      }),
    ).toBe("product_evolution_blocked");
  });

  it("includes era25 fields in steady-state validate JSON", () => {
    const result = evaluateSteadyStateOperatorLoopWithMilestones({});
    expect(result.pathEvaluation.maintenanceMode.prerequisites).toHaveProperty(
      "sustainedOpsConvergenceReady",
    );
    expect(result.pathEvaluation.maintenanceMode.prerequisites).toHaveProperty(
      "pureOperationalModeEra25Active",
    );
    expect(POST_TERMINUS_STEADY_STATE_BLOCKED_MILESTONES).toContain(result.steadyStateMilestone);
  });
});

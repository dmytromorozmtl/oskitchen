import { describe, expect, it } from "vitest";

import {
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_BLOCKED_MILESTONES,
  resolveCommercialPilotPathAbsoluteEndMilestone,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-post-steady-state-orchestrator-era24";
import { evaluateCommercialPilotPathAbsoluteEndWithMilestones } from "@/scripts/ops/validate-commercial-pilot-path-absolute-end";

describe("commercial-pilot-path-absolute-end-era25-integration", () => {
  it("surfaces steady-state prerequisite milestones before steady_state_blocked", () => {
    expect(
      resolveCommercialPilotPathAbsoluteEndMilestone({
        absoluteEndActive: false,
        steadyStateMilestone: "engineering_terminus_blocked",
        firstBlockedStep: null,
        firstBlockedGateStep: null,
      }),
    ).toBe("engineering_terminus_blocked");
  });

  it("includes era25 fields in absolute-end validate JSON", () => {
    const result = evaluateCommercialPilotPathAbsoluteEndWithMilestones({});
    expect(result.steadyState.pathEvaluation.maintenanceMode.prerequisites).toHaveProperty(
      "sustainedOpsConvergenceReady",
    );
    expect(result.steadyState.pathEvaluation.maintenanceMode.prerequisites).toHaveProperty(
      "pureOperationalModeEra25Active",
    );
    expect(COMMERCIAL_PILOT_PATH_ABSOLUTE_END_BLOCKED_MILESTONES).toContain(
      result.absoluteEndMilestone,
    );
  });
});

import { describe, expect, it } from "vitest";

import {
  ERA_CHARTER_CRITERIA,
  POST_TERMINUS_STEADY_STATE_GUARDRAILS,
  STEADY_STATE_RELEASE_TRAIN,
  STEADY_STATE_TRACKS,
  buildSteadyStateTrackStatuses,
  resolveSteadyStatePrerequisites,
} from "@/lib/commercial/post-terminus-steady-state-phases-era24";

describe("post-terminus-steady-state-phases-era24", () => {
  it("defines six steady-state tracks and release train", () => {
    expect(STEADY_STATE_TRACKS).toHaveLength(6);
    expect(STEADY_STATE_RELEASE_TRAIN.length).toBeGreaterThanOrEqual(6);
    expect(ERA_CHARTER_CRITERIA).toHaveLength(5);
    expect(POST_TERMINUS_STEADY_STATE_GUARDRAILS.length).toBeGreaterThanOrEqual(5);
  });

  it("requires engineering terminus for steady state", () => {
    expect(
      resolveSteadyStatePrerequisites({ engineeringTerminusActive: false }).steadyStateActive,
    ).toBe(false);
    expect(
      resolveSteadyStatePrerequisites({ engineeringTerminusActive: true }).steadyStateActive,
    ).toBe(true);
  });

  it("marks maintenance overdue in steady-state tracks", () => {
    const tracks = buildSteadyStateTrackStatuses({
      maintenanceOverdue: 2,
      maintenanceDueSoon: 0,
      improvementOverdue: 0,
      improvementDueSoon: 0,
      productEvolutionOverdue: 0,
      productEvolutionDueSoon: 0,
    });
    const maintenanceTrack = tracks.find((track) => track.id === "weekly_maintenance");
    expect(maintenanceTrack?.status).toBe("overdue");
  });
});

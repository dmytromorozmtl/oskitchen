import { describe, expect, it } from "vitest";

import {
  buildPilotWeek1ExecutionConvergenceBriefingAction,
} from "@/lib/briefing/pilot-week1-execution-convergence-briefing-era25";
import { derivePilotWeek1ExecutionConvergenceState } from "@/lib/commercial/load-pilot-week1-execution-convergence-state-era25";

describe("pilot-week1-execution-convergence-briefing-era25", () => {
  it("returns null when go convergence not ready", () => {
    const week1State = derivePilotWeek1ExecutionConvergenceState({});
    const action = buildPilotWeek1ExecutionConvergenceBriefingAction({
      goConvergenceReady: false,
      week1State,
    });
    expect(action).toBeNull();
  });

  it("returns null when week 1 complete", () => {
    const action = buildPilotWeek1ExecutionConvergenceBriefingAction({
      goConvergenceReady: true,
      week1State: {
        goDecision: "GO",
        prerequisitesComplete: true,
        week1Complete: true,
        readyForDay5Smokes: false,
        completedPhaseCount: 5,
        totalPhaseCount: 5,
        phases: [],
        nextPhaseId: null,
        nextPhaseLabel: null,
        envPresentCount: 5,
        envMissingCount: 0,
      },
    });
    expect(action).toBeNull();
  });

  it("builds ranked action when go ready and week 1 blocked", () => {
    const week1State = derivePilotWeek1ExecutionConvergenceState({});
    const action = buildPilotWeek1ExecutionConvergenceBriefingAction({
      goConvergenceReady: true,
      week1State,
    });
    expect(action).not.toBeNull();
    expect(action?.id).toBe("pilot-week1-execution-convergence-era25");
    expect(action?.ctaLabel).toBe("Open Week 1 convergence");
  });
});

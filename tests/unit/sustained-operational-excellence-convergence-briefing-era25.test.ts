import { describe, expect, it } from "vitest";

import {
  buildSustainedOperationalExcellenceConvergenceBriefingAction,
} from "@/lib/briefing/sustained-operational-excellence-convergence-briefing-era25";
import { deriveSustainedOperationalExcellenceConvergenceState } from "@/lib/commercial/load-sustained-operational-excellence-convergence-state-era25";

describe("sustained-operational-excellence-convergence-briefing-era25", () => {
  it("returns null when market leader convergence not ready", () => {
    const sustainedOpsState = deriveSustainedOperationalExcellenceConvergenceState({});
    const action = buildSustainedOperationalExcellenceConvergenceBriefingAction({
      marketLeaderConvergenceReady: false,
      sustainedOpsState,
    });
    expect(action).toBeNull();
  });

  it("returns null when sustained ops complete", () => {
    const action = buildSustainedOperationalExcellenceConvergenceBriefingAction({
      marketLeaderConvergenceReady: true,
      sustainedOpsState: {
        goDecision: "GO",
        marketLeaderComplete: true,
        prerequisitesComplete: true,
        sustainedOpsComplete: true,
        readyForIntegrationSmokes: false,
        readyForMetricsSmokes: false,
        completedBlockingCount: 4,
        totalBlockingCount: 4,
        phases: [],
        nextPhaseId: null,
        nextPhaseLabel: null,
        envPresentCount: 4,
        envMissingCount: 0,
      },
    });
    expect(action).toBeNull();
  });

  it("builds ranked action when market leader ready and sustained ops blocked", () => {
    const sustainedOpsState = deriveSustainedOperationalExcellenceConvergenceState({});
    const action = buildSustainedOperationalExcellenceConvergenceBriefingAction({
      marketLeaderConvergenceReady: true,
      sustainedOpsState,
    });
    expect(action).not.toBeNull();
    expect(action?.id).toBe("sustained-operational-excellence-convergence-era25");
    expect(action?.ctaLabel).toBe("Open sustained ops convergence");
  });
});

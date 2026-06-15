import { describe, expect, it } from "vitest";

import {
  buildScaleReadinessConvergenceBriefingAction,
} from "@/lib/briefing/scale-readiness-convergence-briefing-era25";
import { deriveScaleReadinessConvergenceState } from "@/lib/commercial/load-scale-readiness-convergence-state-era25";

describe("scale-readiness-convergence-briefing-era25", () => {
  it("returns null when month 2 convergence not ready", () => {
    const scaleState = deriveScaleReadinessConvergenceState({});
    const action = buildScaleReadinessConvergenceBriefingAction({
      month2ConvergenceReady: false,
      scaleState,
    });
    expect(action).toBeNull();
  });

  it("returns null when scale complete", () => {
    const action = buildScaleReadinessConvergenceBriefingAction({
      month2ConvergenceReady: true,
      scaleState: {
        goDecision: "GO",
        month2Complete: true,
        prerequisitesComplete: true,
        scaleComplete: true,
        readyForResilienceSmokes: false,
        completedBlockingCount: 5,
        totalBlockingCount: 5,
        phases: [],
        nextPhaseId: null,
        nextPhaseLabel: null,
        envPresentCount: 7,
        envMissingCount: 0,
      },
    });
    expect(action).toBeNull();
  });

  it("builds ranked action when month 2 ready and scale blocked", () => {
    const scaleState = deriveScaleReadinessConvergenceState({});
    const action = buildScaleReadinessConvergenceBriefingAction({
      month2ConvergenceReady: true,
      scaleState,
    });
    expect(action).not.toBeNull();
    expect(action?.id).toBe("scale-readiness-convergence-era25");
    expect(action?.ctaLabel).toBe("Open Scale convergence");
  });
});

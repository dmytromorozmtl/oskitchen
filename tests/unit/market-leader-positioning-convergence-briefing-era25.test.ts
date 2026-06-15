import { describe, expect, it } from "vitest";

import {
  buildMarketLeaderPositioningConvergenceBriefingAction,
} from "@/lib/briefing/market-leader-positioning-convergence-briefing-era25";
import { deriveMarketLeaderPositioningConvergenceState } from "@/lib/commercial/load-market-leader-positioning-convergence-state-era25";

describe("market-leader-positioning-convergence-briefing-era25", () => {
  it("returns null when series a convergence not ready", () => {
    const marketLeaderState = deriveMarketLeaderPositioningConvergenceState({});
    const action = buildMarketLeaderPositioningConvergenceBriefingAction({
      seriesAConvergenceReady: false,
      marketLeaderState,
    });
    expect(action).toBeNull();
  });

  it("returns null when market leader complete", () => {
    const action = buildMarketLeaderPositioningConvergenceBriefingAction({
      seriesAConvergenceReady: true,
      marketLeaderState: {
        goDecision: "GO",
        seriesAComplete: true,
        prerequisitesComplete: true,
        marketLeaderComplete: true,
        readyForMoatSmokes: false,
        readyForAnalystKitSmokes: false,
        completedBlockingCount: 4,
        totalBlockingCount: 4,
        phases: [],
        nextPhaseId: null,
        nextPhaseLabel: null,
        envPresentCount: 5,
        envMissingCount: 0,
      },
    });
    expect(action).toBeNull();
  });

  it("builds ranked action when series a ready and market leader blocked", () => {
    const marketLeaderState = deriveMarketLeaderPositioningConvergenceState({});
    const action = buildMarketLeaderPositioningConvergenceBriefingAction({
      seriesAConvergenceReady: true,
      marketLeaderState,
    });
    expect(action).not.toBeNull();
    expect(action?.id).toBe("market-leader-positioning-convergence-era25");
    expect(action?.ctaLabel).toBe("Open market leader convergence");
  });
});

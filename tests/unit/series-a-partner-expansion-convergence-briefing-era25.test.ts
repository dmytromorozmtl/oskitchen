import { describe, expect, it } from "vitest";

import {
  buildSeriesAPartnerExpansionConvergenceBriefingAction,
} from "@/lib/briefing/series-a-partner-expansion-convergence-briefing-era25";
import { deriveSeriesAPartnerExpansionConvergenceState } from "@/lib/commercial/load-series-a-partner-expansion-convergence-state-era25";

describe("series-a-partner-expansion-convergence-briefing-era25", () => {
  it("returns null when scale convergence not ready", () => {
    const seriesAState = deriveSeriesAPartnerExpansionConvergenceState({});
    const action = buildSeriesAPartnerExpansionConvergenceBriefingAction({
      scaleConvergenceReady: false,
      seriesAState,
    });
    expect(action).toBeNull();
  });

  it("returns null when series a complete", () => {
    const action = buildSeriesAPartnerExpansionConvergenceBriefingAction({
      scaleConvergenceReady: true,
      seriesAState: {
        goDecision: "GO",
        scaleComplete: true,
        prerequisitesComplete: true,
        seriesAComplete: true,
        readyForDataRoomSmokes: false,
        readyForPartnerSmokes: false,
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

  it("builds ranked action when scale ready and series a blocked", () => {
    const seriesAState = deriveSeriesAPartnerExpansionConvergenceState({});
    const action = buildSeriesAPartnerExpansionConvergenceBriefingAction({
      scaleConvergenceReady: true,
      seriesAState,
    });
    expect(action).not.toBeNull();
    expect(action?.id).toBe("series-a-partner-expansion-convergence-era25");
    expect(action?.ctaLabel).toBe("Open Series A convergence");
  });
});

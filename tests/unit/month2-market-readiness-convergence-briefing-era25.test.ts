import { describe, expect, it } from "vitest";

import {
  buildMonth2MarketReadinessConvergenceBriefingAction,
} from "@/lib/briefing/month2-market-readiness-convergence-briefing-era25";
import { deriveMonth2MarketReadinessConvergenceState } from "@/lib/commercial/load-month2-market-readiness-convergence-state-era25";

describe("month2-market-readiness-convergence-briefing-era25", () => {
  it("returns null when week 1 convergence not ready", () => {
    const month2State = deriveMonth2MarketReadinessConvergenceState({});
    const action = buildMonth2MarketReadinessConvergenceBriefingAction({
      week1ConvergenceReady: false,
      month2State,
    });
    expect(action).toBeNull();
  });

  it("returns null when month 2 complete", () => {
    const action = buildMonth2MarketReadinessConvergenceBriefingAction({
      week1ConvergenceReady: true,
      month2State: {
        goDecision: "GO",
        week1Complete: true,
        prerequisitesComplete: true,
        month2Complete: true,
        readyForInvestorOnepagerSmoke: false,
        metricsBaselinePassed: true,
        caseStudyInternalReady: true,
        completedBlockingCount: 5,
        totalBlockingCount: 5,
        phases: [],
        nextPhaseId: null,
        nextPhaseLabel: null,
        envPresentCount: 10,
        envMissingCount: 0,
      },
    });
    expect(action).toBeNull();
  });

  it("builds ranked action when week 1 ready and month 2 blocked", () => {
    const month2State = deriveMonth2MarketReadinessConvergenceState({});
    const action = buildMonth2MarketReadinessConvergenceBriefingAction({
      week1ConvergenceReady: true,
      month2State,
    });
    expect(action).not.toBeNull();
    expect(action?.id).toBe("month2-market-readiness-convergence-era25");
    expect(action?.ctaLabel).toBe("Open Month 2 convergence");
  });
});

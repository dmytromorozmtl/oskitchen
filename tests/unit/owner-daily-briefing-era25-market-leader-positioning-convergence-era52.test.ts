import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25MarketLeaderPositioningConvergenceAction,
  MARKET_LEADER_POSITIONING_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-market-leader-positioning-convergence-era52";
import { buildScaleReadinessConvergenceEra25UiSlice } from "@/lib/commercial/scale-readiness-convergence-ui-era25";

describe("owner-daily-briefing-era25-market-leader-positioning-convergence-era52", () => {
  it("returns meta action at priority 27 when market leader visible", () => {
    const scale = buildScaleReadinessConvergenceEra25UiSlice({
      month2ConvergenceVisible: true,
      env: {},
    });
    const action = buildOwnerDailyBriefingEra25MarketLeaderPositioningConvergenceAction(
      scale?.seriesAPartnerExpansionConvergence?.marketLeaderPositioningConvergence ?? null,
    );
    expect(action).not.toBeNull();
    expect(action?.priority).toBe(MARKET_LEADER_POSITIONING_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY);
    expect(action?.id).toBe("era25-market-leader-positioning-convergence");
  });
});

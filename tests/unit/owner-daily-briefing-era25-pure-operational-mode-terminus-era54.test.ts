import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25PureOperationalModeTerminusAction,
  PURE_OPERATIONAL_MODE_TERMINUS_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-pure-operational-mode-terminus-era54";
import { buildMarketLeaderPositioningConvergenceEra25UiSlice } from "@/lib/commercial/market-leader-positioning-convergence-ui-era25";

describe("owner-daily-briefing-era25-pure-operational-mode-terminus-era54", () => {
  it("returns meta action at priority 29 when pure ops visible", () => {
    const marketLeader = buildMarketLeaderPositioningConvergenceEra25UiSlice({
      seriesAConvergenceVisible: true,
      env: {},
    });
    const action = buildOwnerDailyBriefingEra25PureOperationalModeTerminusAction(
      marketLeader?.sustainedOperationalExcellenceConvergence?.pureOperationalModeTerminus ?? null,
    );
    expect(action).not.toBeNull();
    expect(action?.priority).toBe(PURE_OPERATIONAL_MODE_TERMINUS_BRIEFING_META_ACTION_PRIORITY);
    expect(action?.id).toBe("era25-pure-operational-mode-terminus");
  });
});

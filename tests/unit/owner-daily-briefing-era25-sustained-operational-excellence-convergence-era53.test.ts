import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25SustainedOperationalExcellenceConvergenceAction,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-sustained-operational-excellence-convergence-era53";
import { buildMarketLeaderPositioningConvergenceEra25UiSlice } from "@/lib/commercial/market-leader-positioning-convergence-ui-era25";

describe("owner-daily-briefing-era25-sustained-operational-excellence-convergence-era53", () => {
  it("returns meta action at priority 28 when sustained ops visible", () => {
    const marketLeader = buildMarketLeaderPositioningConvergenceEra25UiSlice({
      seriesAConvergenceVisible: true,
      env: {},
    });
    const action = buildOwnerDailyBriefingEra25SustainedOperationalExcellenceConvergenceAction(
      marketLeader?.sustainedOperationalExcellenceConvergence ?? null,
    );
    expect(action).not.toBeNull();
    expect(action?.priority).toBe(SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY);
    expect(action?.id).toBe("era25-sustained-operational-excellence-convergence");
  });
});

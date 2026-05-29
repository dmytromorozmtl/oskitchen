import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25Month2MarketReadinessConvergenceAction,
  MONTH2_MARKET_READINESS_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-month2-market-readiness-convergence-era49";
import { buildPilotWeek1ExecutionConvergenceEra25UiSlice } from "@/lib/commercial/pilot-week1-execution-convergence-ui-era25";

describe("owner-daily-briefing-era25-month2-market-readiness-convergence-era49", () => {
  it("returns meta action at priority 24 when month 2 visible", () => {
    const week1 = buildPilotWeek1ExecutionConvergenceEra25UiSlice({
      goConvergenceVisible: true,
      env: {},
    });
    const action = buildOwnerDailyBriefingEra25Month2MarketReadinessConvergenceAction(
      week1?.month2MarketReadinessConvergence ?? null,
    );
    expect(action).not.toBeNull();
    expect(action?.priority).toBe(MONTH2_MARKET_READINESS_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY);
    expect(action?.id).toBe("era25-month2-market-readiness-convergence");
  });
});

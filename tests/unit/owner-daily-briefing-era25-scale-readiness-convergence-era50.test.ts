import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25ScaleReadinessConvergenceAction,
  SCALE_READINESS_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-scale-readiness-convergence-era50";
import { buildMonth2MarketReadinessConvergenceEra25UiSlice } from "@/lib/commercial/month2-market-readiness-convergence-ui-era25";

describe("owner-daily-briefing-era25-scale-readiness-convergence-era50", () => {
  it("returns meta action at priority 25 when scale visible", () => {
    const month2 = buildMonth2MarketReadinessConvergenceEra25UiSlice({
      week1ConvergenceVisible: true,
      env: {},
    });
    const action = buildOwnerDailyBriefingEra25ScaleReadinessConvergenceAction(
      month2?.scaleReadinessConvergence ?? null,
    );
    expect(action).not.toBeNull();
    expect(action?.priority).toBe(SCALE_READINESS_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY);
    expect(action?.id).toBe("era25-scale-readiness-convergence");
  });
});

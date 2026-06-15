import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25SeriesAPartnerExpansionConvergenceAction,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-series-a-partner-expansion-convergence-era51";
import { buildScaleReadinessConvergenceEra25UiSlice } from "@/lib/commercial/scale-readiness-convergence-ui-era25";

describe("owner-daily-briefing-era25-series-a-partner-expansion-convergence-era51", () => {
  it("returns meta action at priority 26 when series A visible", () => {
    const scale = buildScaleReadinessConvergenceEra25UiSlice({
      month2ConvergenceVisible: true,
      env: {},
    });
    const action = buildOwnerDailyBriefingEra25SeriesAPartnerExpansionConvergenceAction(
      scale?.seriesAPartnerExpansionConvergence ?? null,
    );
    expect(action).not.toBeNull();
    expect(action?.priority).toBe(SERIES_A_PARTNER_EXPANSION_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY);
    expect(action?.id).toBe("era25-series-a-partner-expansion-convergence");
  });
});

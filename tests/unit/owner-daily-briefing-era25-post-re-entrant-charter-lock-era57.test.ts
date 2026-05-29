import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25PostReentrantCharterLockAction,
  ERA25_POST_REENTRANT_CHARTER_LOCK_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-post-re-entrant-charter-lock-era57";
import { buildSustainedOperationalExcellenceConvergenceEra25UiSlice } from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";

describe("owner-daily-briefing-era25-post-re-entrant-charter-lock-era57", () => {
  it("exposes meta action priority 32 when charter lock slice visible", () => {
    const sustained = buildSustainedOperationalExcellenceConvergenceEra25UiSlice({
      marketLeaderPositioningConvergenceVisible: true,
      env: {},
    });
    const charterLock =
      sustained?.pureOperationalModeTerminus?.commercialPilotConvergenceTrainClosure
        ?.sustainedProductEvolutionReentrant?.era25PostReentrantCharterLock ?? null;
    const action = buildOwnerDailyBriefingEra25PostReentrantCharterLockAction(charterLock);
    if (charterLock?.visible) {
      expect(action?.priority).toBe(ERA25_POST_REENTRANT_CHARTER_LOCK_BRIEFING_META_ACTION_PRIORITY);
      expect(action?.id).toBe("era25-post-re-entrant-charter-lock");
    }
  });
});

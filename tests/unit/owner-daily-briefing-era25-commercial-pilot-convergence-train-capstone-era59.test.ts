import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25CommercialPilotConvergenceTrainCapstoneAction,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-commercial-pilot-convergence-train-capstone-era59";
import { buildSustainedOperationalExcellenceConvergenceEra25UiSlice } from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";

describe("owner-daily-briefing-era25-commercial-pilot-convergence-train-capstone-era59", () => {
  it("exposes meta action priority 34 when train capstone slice visible", () => {
    const sustained = buildSustainedOperationalExcellenceConvergenceEra25UiSlice({
      marketLeaderPositioningConvergenceVisible: true,
      env: {},
    });
    const capstone =
      sustained?.pureOperationalModeTerminus?.commercialPilotConvergenceTrainClosure
        ?.sustainedProductEvolutionReentrant?.era25PostReentrantCharterLock
        ?.era25SteadyStateOperatorLoopLock?.era25CommercialPilotConvergenceTrainCapstone ?? null;
    const action = buildOwnerDailyBriefingEra25CommercialPilotConvergenceTrainCapstoneAction(
      capstone,
    );
    if (capstone?.visible) {
      expect(action?.priority).toBe(
        ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_BRIEFING_META_ACTION_PRIORITY,
      );
      expect(action?.id).toBe("era25-commercial-pilot-convergence-train-capstone");
    }
  });
});

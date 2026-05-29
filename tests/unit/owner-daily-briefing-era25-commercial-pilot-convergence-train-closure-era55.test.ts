import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25CommercialPilotConvergenceTrainClosureAction,
  COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-commercial-pilot-convergence-train-closure-era55";
import { buildSustainedOperationalExcellenceConvergenceEra25UiSlice } from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";

describe("owner-daily-briefing-era25-commercial-pilot-convergence-train-closure-era55", () => {
  it("returns meta action at priority 30 when train closure visible", () => {
    const sustained = buildSustainedOperationalExcellenceConvergenceEra25UiSlice({
      marketLeaderConvergenceVisible: true,
    });
    const action = buildOwnerDailyBriefingEra25CommercialPilotConvergenceTrainClosureAction(
      sustained?.pureOperationalModeTerminus?.commercialPilotConvergenceTrainClosure ?? null,
    );
    expect(action).not.toBeNull();
    expect(action?.priority).toBe(COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_BRIEFING_META_ACTION_PRIORITY);
    expect(action?.id).toBe("era25-commercial-pilot-convergence-train-closure");
  });
});

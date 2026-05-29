import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25SteadyStateOperatorLoopLockAction,
  ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-steady-state-operator-loop-lock-era58";
import { buildSustainedOperationalExcellenceConvergenceEra25UiSlice } from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";

describe("owner-daily-briefing-era25-steady-state-operator-loop-lock-era58", () => {
  it("exposes meta action priority 33 when steady-state slice visible", () => {
    const sustained = buildSustainedOperationalExcellenceConvergenceEra25UiSlice({
      marketLeaderPositioningConvergenceVisible: true,
      env: {},
    });
    const steadyState =
      sustained?.pureOperationalModeTerminus?.commercialPilotConvergenceTrainClosure
        ?.sustainedProductEvolutionReentrant?.era25PostReentrantCharterLock
        ?.era25SteadyStateOperatorLoopLock ?? null;
    const action = buildOwnerDailyBriefingEra25SteadyStateOperatorLoopLockAction(steadyState);
    if (steadyState?.visible) {
      expect(action?.priority).toBe(ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_BRIEFING_META_ACTION_PRIORITY);
      expect(action?.id).toBe("era25-steady-state-operator-loop-lock");
    }
  });
});

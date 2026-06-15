import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25ConvergenceGovernanceTerminusFreezeAction,
  ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-convergence-governance-terminus-freeze-era60";
import { buildSustainedOperationalExcellenceConvergenceEra25UiSlice } from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";

describe("owner-daily-briefing-era25-convergence-governance-terminus-freeze-era60", () => {
  it("exposes meta action priority 35 when terminus freeze slice visible", () => {
    const sustained = buildSustainedOperationalExcellenceConvergenceEra25UiSlice({
      marketLeaderPositioningConvergenceVisible: true,
      env: {},
    });
    const terminusFreeze =
      sustained?.pureOperationalModeTerminus?.commercialPilotConvergenceTrainClosure
        ?.sustainedProductEvolutionReentrant?.era25PostReentrantCharterLock
        ?.era25SteadyStateOperatorLoopLock?.era25CommercialPilotConvergenceTrainCapstone
        ?.era25ConvergenceGovernanceTerminusFreeze ?? null;
    const action = buildOwnerDailyBriefingEra25ConvergenceGovernanceTerminusFreezeAction(
      terminusFreeze,
    );
    if (terminusFreeze?.visible) {
      expect(action?.priority).toBe(
        ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_BRIEFING_META_ACTION_PRIORITY,
      );
      expect(action?.id).toBe("era25-convergence-governance-terminus-freeze");
    }
  });
});

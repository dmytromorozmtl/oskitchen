import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25GovernanceTrainTerminalSealAction,
  ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-governance-train-terminal-seal-era64";
import { buildEra25GovernanceTrainTerminalSealEra25UiSlice } from "@/lib/commercial/era25-governance-train-terminal-seal-ui-era25";

describe("owner-daily-briefing-era25-governance-train-terminal-seal-era64", () => {
  it("builds ranked action with priority 39", () => {
    const seal = buildEra25GovernanceTrainTerminalSealEra25UiSlice({
      era25PostMarketProofSteadyOperationalWitnessVisible: true,
      era25MarketProofGovernanceChainClosed: false,
      postMarketProofSteadyOpsWitnessActive: false,
      env: {},
    });
    const action = buildOwnerDailyBriefingEra25GovernanceTrainTerminalSealAction(seal);
    expect(action?.priority).toBe(ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_BRIEFING_META_ACTION_PRIORITY);
    expect(action?.id).toBe("era25-governance-train-terminal-seal");
  });
});

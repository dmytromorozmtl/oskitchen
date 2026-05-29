import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25PostTerminalSealCommercialOpsPermanenceAction,
  ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-post-terminal-seal-commercial-ops-permanence-era65";
import { buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-ui-era25";

describe("owner-daily-briefing-era25-post-terminal-seal-commercial-ops-permanence-era65", () => {
  it("builds ranked action with priority 40", () => {
    const permanence = buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice({
      era25GovernanceTrainTerminalSealVisible: true,
      era25MarketProofGovernanceChainClosed: false,
      era25GovernanceTrainSealed: false,
      postMarketProofSteadyOpsWitnessActive: false,
      env: {},
    });
    const action = buildOwnerDailyBriefingEra25PostTerminalSealCommercialOpsPermanenceAction(permanence);
    expect(action?.priority).toBe(
      ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_BRIEFING_META_ACTION_PRIORITY,
    );
    expect(action?.id).toBe("era25-post-terminal-seal-commercial-ops-permanence");
  });
});

import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25BandAGovernanceChainCapstoneWitnessAction,
  ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-band-a-governance-chain-capstone-witness-era66";
import { buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-ui-era25";

describe("owner-daily-briefing-era25-band-a-governance-chain-capstone-witness-era66", () => {
  it("builds ranked action with priority 41", () => {
    const permanence = buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice({
      era25GovernanceTrainTerminalSealVisible: true,
      era25MarketProofGovernanceChainClosed: false,
      era25GovernanceTrainSealed: false,
      postMarketProofSteadyOpsWitnessActive: false,
      env: {},
    });
    const capstone = permanence?.era25BandAGovernanceChainCapstoneWitness ?? null;
    const action = buildOwnerDailyBriefingEra25BandAGovernanceChainCapstoneWitnessAction(capstone);
    expect(action?.priority).toBe(
      ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_BRIEFING_META_ACTION_PRIORITY,
    );
    expect(action?.id).toBe("era25-band-a-governance-chain-capstone-witness");
  });
});

import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25PostMarketProofSteadyOperationalWitnessAction,
  ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-post-market-proof-steady-operational-witness-era63";
import { buildEra25PostMarketProofSteadyOperationalWitnessEra25UiSlice } from "@/lib/commercial/era25-post-market-proof-steady-operational-witness-ui-era25";

describe("owner-daily-briefing-era25-post-market-proof-steady-operational-witness-era63", () => {
  it("builds ranked action with priority 38", () => {
    const witness = buildEra25PostMarketProofSteadyOperationalWitnessEra25UiSlice({
      era25P0MarketProofHonestClosureCapstoneVisible: true,
      era25MarketProofGovernanceChainClosed: false,
      env: {},
    });
    const action = buildOwnerDailyBriefingEra25PostMarketProofSteadyOperationalWitnessAction(witness);
    expect(action?.priority).toBe(ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_BRIEFING_META_ACTION_PRIORITY);
    expect(action?.id).toBe("era25-post-market-proof-steady-operational-witness");
  });
});

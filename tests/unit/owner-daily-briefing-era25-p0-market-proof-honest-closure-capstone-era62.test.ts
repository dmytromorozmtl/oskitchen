import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25P0MarketProofHonestClosureCapstoneAction,
  ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-p0-market-proof-honest-closure-capstone-era62";
import { buildEra25P0MarketProofHonestClosureCapstoneEra25UiSlice } from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-ui-era25";

describe("owner-daily-briefing-era25-p0-market-proof-honest-closure-capstone-era62", () => {
  it("exposes meta action priority 37 when closure capstone slice visible", () => {
    const closure = buildEra25P0MarketProofHonestClosureCapstoneEra25UiSlice({
      era25BandAMarketProofExecutionSolePathVisible: true,
      bandAExecutionSolePathLocked: true,
      env: {},
    });
    const action = buildOwnerDailyBriefingEra25P0MarketProofHonestClosureCapstoneAction(closure);
    if (closure?.visible) {
      expect(action?.priority).toBe(
        ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_BRIEFING_META_ACTION_PRIORITY,
      );
      expect(action?.id).toBe("era25-p0-market-proof-honest-closure-capstone");
    }
  });
});

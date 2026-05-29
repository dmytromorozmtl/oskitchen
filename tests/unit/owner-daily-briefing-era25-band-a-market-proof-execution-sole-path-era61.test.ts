import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25BandAMarketProofExecutionSolePathAction,
  ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-band-a-market-proof-execution-sole-path-era61";
import { buildEra25BandAMarketProofExecutionSolePathEra25UiSlice } from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-ui-era25";

describe("owner-daily-briefing-era25-band-a-market-proof-execution-sole-path-era61", () => {
  it("exposes meta action priority 36 when sole-path slice visible", () => {
    const solePath = buildEra25BandAMarketProofExecutionSolePathEra25UiSlice({
      era25ConvergenceGovernanceTerminusFreezeVisible: true,
      terminusFreezeComplete: false,
      env: {},
    });
    const action = buildOwnerDailyBriefingEra25BandAMarketProofExecutionSolePathAction(solePath);
    if (solePath?.visible) {
      expect(action?.priority).toBe(
        ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_BRIEFING_META_ACTION_PRIORITY,
      );
      expect(action?.id).toBe("era25-band-a-market-proof-execution-sole-path");
    }
  });
});

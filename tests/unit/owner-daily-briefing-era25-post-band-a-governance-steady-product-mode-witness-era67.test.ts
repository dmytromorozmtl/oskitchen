import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25PostBandAGovernanceSteadyProductModeWitnessAction,
  ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-post-band-a-governance-steady-product-mode-witness-era67";
import { buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-ui-era25";

describe("owner-daily-briefing-era25-post-band-a-governance-steady-product-mode-witness-era67", () => {
  it("builds ranked action with priority 42", () => {
    const permanence = buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice({
      era25GovernanceTrainTerminalSealVisible: true,
      era25MarketProofGovernanceChainClosed: false,
      era25GovernanceTrainSealed: false,
      postMarketProofSteadyOpsWitnessActive: false,
      env: {},
    });
    const steady =
      permanence?.era25BandAGovernanceChainCapstoneWitness
        ?.era25PostBandAGovernanceSteadyProductModeWitness ?? null;
    const action = buildOwnerDailyBriefingEra25PostBandAGovernanceSteadyProductModeWitnessAction(steady);
    expect(action?.priority).toBe(
      ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_BRIEFING_META_ACTION_PRIORITY,
    );
    expect(action?.id).toBe("era25-post-band-a-governance-steady-product-mode-witness");
  });
});

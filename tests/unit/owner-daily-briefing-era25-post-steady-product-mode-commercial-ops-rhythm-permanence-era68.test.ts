import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25PostSteadyProductModeCommercialOpsRhythmPermanenceAction,
  ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_BRIEFING_META_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-era68";
import { buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-ui-era25";

describe("owner-daily-briefing-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-era68", () => {
  it("builds ranked action with priority 43", () => {
    const permanence = buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice({
      era25GovernanceTrainTerminalSealVisible: true,
      era25MarketProofGovernanceChainClosed: false,
      era25GovernanceTrainSealed: false,
      postMarketProofSteadyOpsWitnessActive: false,
      env: {},
    });
    const rhythm =
      permanence?.era25BandAGovernanceChainCapstoneWitness?.era25PostBandAGovernanceSteadyProductModeWitness
        ?.era25PostSteadyProductModeCommercialOpsRhythmPermanence ?? null;
    const action =
      buildOwnerDailyBriefingEra25PostSteadyProductModeCommercialOpsRhythmPermanenceAction(rhythm);
    expect(action?.priority).toBe(
      ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_BRIEFING_META_ACTION_PRIORITY,
    );
    expect(action?.id).toBe("era25-post-steady-product-mode-commercial-ops-rhythm-permanence");
  });
});

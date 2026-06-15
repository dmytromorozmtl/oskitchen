import { describe, expect, it } from "vitest";

import { buildOwnerDailyBriefingEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessAction } from "@/lib/briefing/owner-daily-briefing-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-era69";
import { buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-ui-era25";
import { ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_BRIEFING_META_ACTION_PRIORITY } from "@/lib/briefing/owner-daily-briefing-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-era69";

describe("owner-daily-briefing-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-era69", () => {
  it("builds ranked action from nested terminal closure witness slice", () => {
    const permanence = buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice({
      era25GovernanceTrainTerminalSealVisible: true,
      era25MarketProofGovernanceChainClosed: false,
      era25GovernanceTrainSealed: false,
      postMarketProofSteadyOpsWitnessActive: false,
      env: {},
    });
    const witnessSlice =
      permanence?.era25BandAGovernanceChainCapstoneWitness?.era25PostBandAGovernanceSteadyProductModeWitness
        ?.era25PostSteadyProductModeCommercialOpsRhythmPermanence
        ?.era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitness ?? null;
    const action =
      buildOwnerDailyBriefingEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessAction(
        witnessSlice,
      );
    expect(action).not.toBeNull();
    expect(action?.priority).toBe(
      ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_BRIEFING_META_ACTION_PRIORITY,
    );
    expect(action?.id).toBe("era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness");
  });
});

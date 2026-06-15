import { describe, expect, it } from "vitest";

import { buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-ui-era25";
import { buildLaunchWizardEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessSlice } from "@/lib/launch-wizard/launch-wizard-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-era69";

describe("launch-wizard-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-era69", () => {
  it("maps terminal closure witness UI slice to launch wizard slice", () => {
    const permanence = buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice({
      era25GovernanceTrainTerminalSealVisible: true,
      era25MarketProofGovernanceChainClosed: false,
      era25GovernanceTrainSealed: false,
      postMarketProofSteadyOpsWitnessActive: false,
      env: {},
    });
    const witness =
      permanence?.era25BandAGovernanceChainCapstoneWitness?.era25PostBandAGovernanceSteadyProductModeWitness
        ?.era25PostSteadyProductModeCommercialOpsRhythmPermanence
        ?.era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitness ?? null;
    const slice = buildLaunchWizardEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessSlice(witness);
    expect(slice).not.toBeNull();
    if (witness && slice) {
      expect(slice.era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityFailed).toBe(
        !witness.era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityPassed,
      );
      expect(slice.terminalClosureWitnessBlocked).toBe(witness.terminalClosureWitnessBlocked);
    }
  });
});

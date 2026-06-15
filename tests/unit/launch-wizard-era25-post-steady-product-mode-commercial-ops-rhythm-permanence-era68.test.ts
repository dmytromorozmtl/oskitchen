import { describe, expect, it } from "vitest";

import { buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-ui-era25";
import { buildLaunchWizardEra25PostSteadyProductModeCommercialOpsRhythmPermanenceSlice } from "@/lib/launch-wizard/launch-wizard-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-era68";

describe("launch-wizard-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-era68", () => {
  it("maps rhythm permanence UI slice to launch wizard slice", () => {
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
    const slice = buildLaunchWizardEra25PostSteadyProductModeCommercialOpsRhythmPermanenceSlice(rhythm);
    expect(slice).not.toBeNull();
    if (rhythm && slice) {
      expect(slice.era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityFailed).toBe(
        !rhythm.era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityPassed,
      );
      expect(slice.rhythmPermanenceBlocked).toBe(rhythm.rhythmPermanenceBlocked);
    }
  });
});

import { describe, expect, it } from "vitest";

import { buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-ui-era25";
import { buildLaunchWizardEra25PostBandAGovernanceSteadyProductModeWitnessSlice } from "@/lib/launch-wizard/launch-wizard-era25-post-band-a-governance-steady-product-mode-witness-era67";

describe("launch-wizard-era25-post-band-a-governance-steady-product-mode-witness-era67", () => {
  it("maps steady product mode witness UI slice to launch wizard slice", () => {
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
    const slice = buildLaunchWizardEra25PostBandAGovernanceSteadyProductModeWitnessSlice(steady);
    expect(slice).not.toBeNull();
    if (steady && slice) {
      expect(slice.era25PostBandAGovernanceSteadyProductModeWitnessIntegrityFailed).toBe(
        !steady.era25PostBandAGovernanceSteadyProductModeWitnessIntegrityPassed,
      );
      expect(slice.steadyProductModeWitnessBlocked).toBe(steady.steadyProductModeWitnessBlocked);
    }
  });
});

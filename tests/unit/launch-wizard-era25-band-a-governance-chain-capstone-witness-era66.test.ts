import { describe, expect, it } from "vitest";

import { buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-ui-era25";
import { buildLaunchWizardEra25BandAGovernanceChainCapstoneWitnessSlice } from "@/lib/launch-wizard/launch-wizard-era25-band-a-governance-chain-capstone-witness-era66";

describe("launch-wizard-era25-band-a-governance-chain-capstone-witness-era66", () => {
  it("maps capstone witness UI slice to launch wizard slice", () => {
    const permanence = buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice({
      era25GovernanceTrainTerminalSealVisible: true,
      era25MarketProofGovernanceChainClosed: false,
      era25GovernanceTrainSealed: false,
      postMarketProofSteadyOpsWitnessActive: false,
      env: {},
    });
    const capstone = permanence?.era25BandAGovernanceChainCapstoneWitness ?? null;
    const slice = buildLaunchWizardEra25BandAGovernanceChainCapstoneWitnessSlice(capstone);
    expect(slice).not.toBeNull();
    if (capstone && slice) {
      expect(slice.era25BandAGovernanceChainCapstoneWitnessIntegrityFailed).toBe(
        !capstone.era25BandAGovernanceChainCapstoneWitnessIntegrityPassed,
      );
      expect(slice.capstoneWitnessBlocked).toBe(capstone.capstoneWitnessBlocked);
    }
  });
});

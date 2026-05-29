import { describe, expect, it } from "vitest";

import { buildEra25PostMarketProofSteadyOperationalWitnessEra25UiSlice } from "@/lib/commercial/era25-post-market-proof-steady-operational-witness-ui-era25";
import { buildLaunchWizardEra25PostMarketProofSteadyOperationalWitnessSlice } from "@/lib/launch-wizard/launch-wizard-era25-post-market-proof-steady-operational-witness-era63";

describe("launch-wizard-era25-post-market-proof-steady-operational-witness-era63", () => {
  it("maps witness UI slice to launch wizard slice", () => {
    const witness = buildEra25PostMarketProofSteadyOperationalWitnessEra25UiSlice({
      era25P0MarketProofHonestClosureCapstoneVisible: true,
      era25MarketProofGovernanceChainClosed: false,
      env: {},
    });
    const slice = buildLaunchWizardEra25PostMarketProofSteadyOperationalWitnessSlice(witness);
    expect(slice).not.toBeNull();
    if (witness && slice) {
      expect(slice.era25PostMarketProofSteadyOperationalWitnessIntegrityFailed).toBe(
        !witness.era25PostMarketProofSteadyOperationalWitnessIntegrityPassed,
      );
      expect(slice.witnessBlocked).toBe(witness.witnessBlocked);
    }
  });
});

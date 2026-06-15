import { describe, expect, it } from "vitest";

import { buildEra25GovernanceTrainTerminalSealEra25UiSlice } from "@/lib/commercial/era25-governance-train-terminal-seal-ui-era25";
import { buildLaunchWizardEra25GovernanceTrainTerminalSealSlice } from "@/lib/launch-wizard/launch-wizard-era25-governance-train-terminal-seal-era64";

describe("launch-wizard-era25-governance-train-terminal-seal-era64", () => {
  it("maps seal UI slice to launch wizard slice", () => {
    const seal = buildEra25GovernanceTrainTerminalSealEra25UiSlice({
      era25PostMarketProofSteadyOperationalWitnessVisible: true,
      era25MarketProofGovernanceChainClosed: false,
      postMarketProofSteadyOpsWitnessActive: false,
      env: {},
    });
    const slice = buildLaunchWizardEra25GovernanceTrainTerminalSealSlice(seal);
    expect(slice).not.toBeNull();
    if (seal && slice) {
      expect(slice.era25GovernanceTrainTerminalSealIntegrityFailed).toBe(
        !seal.era25GovernanceTrainTerminalSealIntegrityPassed,
      );
      expect(slice.sealBlocked).toBe(seal.sealBlocked);
    }
  });
});

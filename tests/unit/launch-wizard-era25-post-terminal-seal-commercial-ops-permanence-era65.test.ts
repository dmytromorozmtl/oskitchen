import { describe, expect, it } from "vitest";

import { buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-ui-era25";
import { buildLaunchWizardEra25PostTerminalSealCommercialOpsPermanenceSlice } from "@/lib/launch-wizard/launch-wizard-era25-post-terminal-seal-commercial-ops-permanence-era65";

describe("launch-wizard-era25-post-terminal-seal-commercial-ops-permanence-era65", () => {
  it("maps permanence UI slice to launch wizard slice", () => {
    const permanence = buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice({
      era25GovernanceTrainTerminalSealVisible: true,
      era25MarketProofGovernanceChainClosed: false,
      era25GovernanceTrainSealed: false,
      postMarketProofSteadyOpsWitnessActive: false,
      env: {},
    });
    const slice = buildLaunchWizardEra25PostTerminalSealCommercialOpsPermanenceSlice(permanence);
    expect(slice).not.toBeNull();
    if (permanence && slice) {
      expect(slice.era25PostTerminalSealCommercialOpsPermanenceIntegrityFailed).toBe(
        !permanence.era25PostTerminalSealCommercialOpsPermanenceIntegrityPassed,
      );
      expect(slice.permanenceBlocked).toBe(permanence.permanenceBlocked);
    }
  });
});

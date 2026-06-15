import { describe, expect, it } from "vitest";

import { buildEra25BandAMarketProofExecutionSolePathEra25UiSlice } from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-ui-era25";
import {
  buildLaunchWizardEra25BandAMarketProofExecutionSolePathSlice,
  launchWizardEra25BandAMarketProofExecutionSolePathHref,
} from "@/lib/launch-wizard/launch-wizard-era25-band-a-market-proof-execution-sole-path-era61";

describe("launch-wizard-era25-band-a-market-proof-execution-sole-path-era61", () => {
  it("builds sole-path launch wizard slice from era25 UI slice", () => {
    const solePath = buildEra25BandAMarketProofExecutionSolePathEra25UiSlice({
      era25ConvergenceGovernanceTerminusFreezeVisible: true,
      terminusFreezeComplete: false,
      env: {},
    });
    const slice = buildLaunchWizardEra25BandAMarketProofExecutionSolePathSlice(solePath, "Acme");
    if (solePath) {
      expect(slice!.era25BandAMarketProofExecutionSolePathIntegrityFailed).toBe(
        !solePath.era25BandAMarketProofExecutionSolePathIntegrityPassed,
      );
    }
    expect(launchWizardEra25BandAMarketProofExecutionSolePathHref()).toContain(
      "launch-wizard-era25-band-a-market-proof-execution-sole-path",
    );
  });
});

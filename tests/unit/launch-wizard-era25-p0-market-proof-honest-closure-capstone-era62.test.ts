import { describe, expect, it } from "vitest";

import { buildEra25P0MarketProofHonestClosureCapstoneEra25UiSlice } from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-ui-era25";
import {
  buildLaunchWizardEra25P0MarketProofHonestClosureCapstoneSlice,
  launchWizardEra25P0MarketProofHonestClosureCapstoneHref,
} from "@/lib/launch-wizard/launch-wizard-era25-p0-market-proof-honest-closure-capstone-era62";

describe("launch-wizard-era25-p0-market-proof-honest-closure-capstone-era62", () => {
  it("builds closure capstone launch wizard slice from era25 UI slice", () => {
    const closure = buildEra25P0MarketProofHonestClosureCapstoneEra25UiSlice({
      era25BandAMarketProofExecutionSolePathVisible: true,
      bandAExecutionSolePathLocked: true,
      env: {},
    });
    const slice = buildLaunchWizardEra25P0MarketProofHonestClosureCapstoneSlice(closure, "Acme");
    if (closure) {
      expect(slice!.era25P0MarketProofHonestClosureCapstoneIntegrityFailed).toBe(
        !closure.era25P0MarketProofHonestClosureCapstoneIntegrityPassed,
      );
    }
    expect(launchWizardEra25P0MarketProofHonestClosureCapstoneHref()).toContain(
      "launch-wizard-era25-p0-market-proof-honest-closure-capstone",
    );
  });
});

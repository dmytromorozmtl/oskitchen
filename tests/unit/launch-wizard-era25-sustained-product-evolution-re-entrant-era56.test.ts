import { describe, expect, it } from "vitest";

import { buildSustainedOperationalExcellenceConvergenceEra25UiSlice } from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";
import {
  buildLaunchWizardEra25SustainedProductEvolutionReentrantSlice,
  launchWizardEra25SustainedProductEvolutionReentrantHref,
} from "@/lib/launch-wizard/launch-wizard-era25-sustained-product-evolution-re-entrant-era56";

describe("launch-wizard-era25-sustained-product-evolution-re-entrant-era56", () => {
  it("builds slice when re-entrant train active with integrity flags", () => {
    const sustained = buildSustainedOperationalExcellenceConvergenceEra25UiSlice({
      marketLeaderConvergenceVisible: true,
      env: { SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA25_ATTESTED: "1" },
    });
    const trainClosure =
      sustained?.pureOperationalModeTerminus?.commercialPilotConvergenceTrainClosure ?? null;
    const reentrant = trainClosure?.sustainedProductEvolutionReentrant ?? null;
    const slice = buildLaunchWizardEra25SustainedProductEvolutionReentrantSlice(reentrant, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.sustainedProductEvolutionReentrantIntegrityFailed).toBe(true);
    expect(launchWizardEra25SustainedProductEvolutionReentrantHref()).toContain(
      "#launch-wizard-era25-sustained-product-evolution-re-entrant",
    );
  });
});

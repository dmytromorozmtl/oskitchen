import { describe, expect, it } from "vitest";

import { buildSustainedOperationalExcellenceConvergenceEra25UiSlice } from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";
import {
  buildLaunchWizardEra25CommercialPilotConvergenceTrainCapstoneSlice,
  launchWizardEra25CommercialPilotConvergenceTrainCapstoneHref,
} from "@/lib/launch-wizard/launch-wizard-era25-commercial-pilot-convergence-train-capstone-era59";

describe("launch-wizard-era25-commercial-pilot-convergence-train-capstone-era59", () => {
  it("builds train capstone slice from sustained ops convergence stack", () => {
    const sustained = buildSustainedOperationalExcellenceConvergenceEra25UiSlice({
      marketLeaderPositioningConvergenceVisible: true,
      env: {},
    });
    const capstone =
      sustained?.pureOperationalModeTerminus?.commercialPilotConvergenceTrainClosure
        ?.sustainedProductEvolutionReentrant?.era25PostReentrantCharterLock
        ?.era25SteadyStateOperatorLoopLock?.era25CommercialPilotConvergenceTrainCapstone ?? null;
    const slice = buildLaunchWizardEra25CommercialPilotConvergenceTrainCapstoneSlice(
      capstone,
      "Acme",
    );
    if (capstone) {
      expect(slice!.era25CommercialPilotConvergenceTrainCapstoneIntegrityFailed).toBe(
        !capstone.era25CommercialPilotConvergenceTrainCapstoneIntegrityPassed,
      );
    }
    expect(launchWizardEra25CommercialPilotConvergenceTrainCapstoneHref()).toContain(
      "launch-wizard-era25-commercial-pilot-convergence-train-capstone",
    );
  });
});

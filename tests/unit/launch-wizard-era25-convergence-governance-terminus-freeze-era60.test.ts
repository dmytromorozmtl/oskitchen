import { describe, expect, it } from "vitest";

import { buildSustainedOperationalExcellenceConvergenceEra25UiSlice } from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";
import {
  buildLaunchWizardEra25ConvergenceGovernanceTerminusFreezeSlice,
  launchWizardEra25ConvergenceGovernanceTerminusFreezeHref,
} from "@/lib/launch-wizard/launch-wizard-era25-convergence-governance-terminus-freeze-era60";

describe("launch-wizard-era25-convergence-governance-terminus-freeze-era60", () => {
  it("builds terminus freeze slice from sustained ops convergence stack", () => {
    const sustained = buildSustainedOperationalExcellenceConvergenceEra25UiSlice({
      marketLeaderPositioningConvergenceVisible: true,
      env: {},
    });
    const terminusFreeze =
      sustained?.pureOperationalModeTerminus?.commercialPilotConvergenceTrainClosure
        ?.sustainedProductEvolutionReentrant?.era25PostReentrantCharterLock
        ?.era25SteadyStateOperatorLoopLock?.era25CommercialPilotConvergenceTrainCapstone
        ?.era25ConvergenceGovernanceTerminusFreeze ?? null;
    const slice = buildLaunchWizardEra25ConvergenceGovernanceTerminusFreezeSlice(
      terminusFreeze,
      "Acme",
    );
    if (terminusFreeze) {
      expect(slice!.era25ConvergenceGovernanceTerminusFreezeIntegrityFailed).toBe(
        !terminusFreeze.era25ConvergenceGovernanceTerminusFreezeIntegrityPassed,
      );
    }
    expect(launchWizardEra25ConvergenceGovernanceTerminusFreezeHref()).toContain(
      "launch-wizard-era25-convergence-governance-terminus-freeze",
    );
  });
});

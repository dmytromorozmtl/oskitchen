import { describe, expect, it } from "vitest";

import { buildSustainedOperationalExcellenceConvergenceEra25UiSlice } from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";
import {
  buildLaunchWizardEra25SteadyStateOperatorLoopLockSlice,
  launchWizardEra25SteadyStateOperatorLoopLockHref,
} from "@/lib/launch-wizard/launch-wizard-era25-steady-state-operator-loop-lock-era58";

describe("launch-wizard-era25-steady-state-operator-loop-lock-era58", () => {
  it("builds steady-state lock slice from sustained ops convergence stack", () => {
    const sustained = buildSustainedOperationalExcellenceConvergenceEra25UiSlice({
      marketLeaderPositioningConvergenceVisible: true,
      env: {},
    });
    const charterLock =
      sustained?.pureOperationalModeTerminus?.commercialPilotConvergenceTrainClosure
        ?.sustainedProductEvolutionReentrant?.era25PostReentrantCharterLock ?? null;
    const steadyState = charterLock?.era25SteadyStateOperatorLoopLock ?? null;
    const slice = buildLaunchWizardEra25SteadyStateOperatorLoopLockSlice(steadyState, "Acme");
    if (steadyState) {
      expect(slice!.era25SteadyStateOperatorLoopLockIntegrityFailed).toBe(
        !steadyState.era25SteadyStateOperatorLoopLockIntegrityPassed,
      );
    }
    expect(launchWizardEra25SteadyStateOperatorLoopLockHref()).toContain(
      "launch-wizard-era25-steady-state-operator-loop-lock",
    );
  });
});

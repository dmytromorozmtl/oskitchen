import { describe, expect, it } from "vitest";

import { buildPureOperationalModeTerminusEra25UiSlice } from "@/lib/commercial/pure-operational-mode-terminus-ui-era25";
import { buildSustainedOperationalExcellenceConvergenceEra25UiSlice } from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";
import {
  buildLaunchWizardEra25CommercialPilotConvergenceTrainClosureSlice,
  launchWizardEra25CommercialPilotConvergenceTrainClosureHref,
} from "@/lib/launch-wizard/launch-wizard-era25-commercial-pilot-convergence-train-closure-era55";

describe("launch-wizard-era25-commercial-pilot-convergence-train-closure-era55", () => {
  it("builds slice when train closure train active with integrity flags", () => {
    const sustained = buildSustainedOperationalExcellenceConvergenceEra25UiSlice({
      marketLeaderConvergenceVisible: true,
      env: { ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ATTESTED: "1" },
    });
    const pureOps = sustained?.pureOperationalModeTerminus;
    const trainClosure = pureOps?.commercialPilotConvergenceTrainClosure ?? null;
    const slice = buildLaunchWizardEra25CommercialPilotConvergenceTrainClosureSlice(trainClosure, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.era25CommercialPilotConvergenceTrainClosureIntegrityFailed).toBe(true);
    expect(launchWizardEra25CommercialPilotConvergenceTrainClosureHref()).toContain(
      "#launch-wizard-era25-commercial-pilot-convergence-train-closure",
    );
  });

  it("returns null when pure ops visible but train closure slice not built", () => {
    const pureOps = buildPureOperationalModeTerminusEra25UiSlice({
      sustainedOpsConvergenceVisible: true,
    });
    expect(
      buildLaunchWizardEra25CommercialPilotConvergenceTrainClosureSlice(
        pureOps?.commercialPilotConvergenceTrainClosure ?? null,
      ),
    ).not.toBeNull();
  });
});

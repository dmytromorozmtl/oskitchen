import { describe, expect, it } from "vitest";

import {
  buildPureOperationalModeTerminusEra25UiSlice,
  shouldSuppressEra25ProductConvergenceSurfaces,
} from "@/lib/commercial/pure-operational-mode-terminus-ui-era25";
import { buildSustainedOperationalExcellenceConvergenceEra25UiSlice } from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";

describe("pure-operational-mode-terminus-ui-era25", () => {
  it("returns null when sustained ops convergence not visible", () => {
    expect(
      buildPureOperationalModeTerminusEra25UiSlice({
        sustainedOpsConvergenceVisible: false,
      }),
    ).toBeNull();
  });

  it("builds visible slice when sustained ops convergence visible", () => {
    const slice = buildPureOperationalModeTerminusEra25UiSlice({
      sustainedOpsConvergenceVisible: true,
    });
    expect(slice?.visible).toBe(true);
    expect(slice?.platformOpsHref).toContain("#era25-pure-operational-mode-terminus");
    expect(slice?.improvementLoopHref).toContain("#continuous-improvement-loop");
  });

  it("nests under sustained ops convergence slice", () => {
    const sustained = buildSustainedOperationalExcellenceConvergenceEra25UiSlice({
      marketLeaderConvergenceVisible: true,
    });
    expect(sustained?.pureOperationalModeTerminus?.visible).toBe(true);
    expect(sustained?.pureOperationalModeTerminus?.commercialPilotConvergenceTrainClosure?.visible).toBe(
      true,
    );
    expect(
      sustained?.pureOperationalModeTerminus?.commercialPilotConvergenceTrainClosure
        ?.sustainedProductEvolutionReentrant?.visible,
    ).toBe(true);
  });

  it("suppresses era25 convergence surfaces when terminus active", () => {
    expect(
      shouldSuppressEra25ProductConvergenceSurfaces({ pureOperationalModeEra25Active: true }),
    ).toBe(true);
    expect(
      shouldSuppressEra25ProductConvergenceSurfaces({ pureOperationalModeEra25Active: false }),
    ).toBe(false);
  });
});

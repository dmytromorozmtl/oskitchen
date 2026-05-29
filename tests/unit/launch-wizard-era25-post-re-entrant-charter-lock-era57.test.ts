import { describe, expect, it } from "vitest";

import { buildSustainedOperationalExcellenceConvergenceEra25UiSlice } from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";
import {
  buildLaunchWizardEra25PostReentrantCharterLockSlice,
  launchWizardEra25PostReentrantCharterLockHref,
} from "@/lib/launch-wizard/launch-wizard-era25-post-re-entrant-charter-lock-era57";

describe("launch-wizard-era25-post-re-entrant-charter-lock-era57", () => {
  it("builds charter lock slice from sustained ops convergence stack", () => {
    const sustained = buildSustainedOperationalExcellenceConvergenceEra25UiSlice({
      marketLeaderPositioningConvergenceVisible: true,
      env: {},
    });
    const trainClosure =
      sustained?.pureOperationalModeTerminus?.commercialPilotConvergenceTrainClosure ?? null;
    const reentrant = trainClosure?.sustainedProductEvolutionReentrant ?? null;
    const charterLock = reentrant?.era25PostReentrantCharterLock ?? null;
    const slice = buildLaunchWizardEra25PostReentrantCharterLockSlice(charterLock, "Acme");
    if (charterLock) {
      expect(slice!.era25PostReentrantCharterLockIntegrityFailed).toBe(
        !charterLock.era25PostReentrantCharterLockIntegrityPassed,
      );
    }
    expect(launchWizardEra25PostReentrantCharterLockHref()).toContain(
      "launch-wizard-era25-post-re-entrant-charter-lock",
    );
  });
});

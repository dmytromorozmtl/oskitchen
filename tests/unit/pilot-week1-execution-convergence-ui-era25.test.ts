import { describe, expect, it } from "vitest";

import {
  buildPilotWeek1ExecutionConvergenceEra25UiSlice,
  formatPilotWeek1ExecutionConvergenceEra25Label,
} from "@/lib/commercial/pilot-week1-execution-convergence-ui-era25";

describe("pilot-week1-execution-convergence-ui-era25", { timeout: 120_000 }, () => {
  it("returns null when go convergence not visible", () => {
    expect(
      buildPilotWeek1ExecutionConvergenceEra25UiSlice({ goConvergenceVisible: false }),
    ).toBeNull();
  });

  it("builds slice when go convergence visible", () => {
    const slice = buildPilotWeek1ExecutionConvergenceEra25UiSlice({
      goConvergenceVisible: true,
      env: {},
    });
    expect(slice).not.toBeNull();
    expect(slice?.outsideLinearCatalog).toBe(true);
    expect(slice?.pilotWeek1ExecutionConvergenceEra25Milestone).toBe(
      "go_convergence_regression_blocked",
    );
    expect(slice?.postGoConvergenceOrchestratorCommand).toContain(
      "run-pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25",
    );
    expect(slice?.integrityValidateCommand).toContain(
      "validate-pilot-week1-execution-convergence-integrity",
    );
    expect(slice?.launchWizardHref).toContain(
      "#launch-wizard-era25-pilot-week1-execution-convergence",
    );
  });

  it("builds slice when week 1 train started without go convergence visible", () => {
    const slice = buildPilotWeek1ExecutionConvergenceEra25UiSlice({
      goConvergenceVisible: false,
      env: { PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_ATTESTED: "1" },
    });
    expect(slice).not.toBeNull();
    expect(slice?.pilotWeek1ExecutionConvergenceIntegrityPassed).toBe(false);
  });

  it("formats convergence label", () => {
    const slice = buildPilotWeek1ExecutionConvergenceEra25UiSlice({
      goConvergenceVisible: true,
      env: {},
    });
    expect(slice).not.toBeNull();
    if (!slice) return;
    expect(formatPilotWeek1ExecutionConvergenceEra25Label(slice)).toContain("week 1");
    expect(formatPilotWeek1ExecutionConvergenceEra25Label(slice)).toContain("BLOCKED");
  });
});

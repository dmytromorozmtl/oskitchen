import { describe, expect, it } from "vitest";

import {
  buildPostTerminusSteadyStateUiSlice,
  formatPostTerminusSteadyStateProgressLabel,
} from "@/lib/commercial/post-terminus-steady-state-ui-era24";

describe("post-terminus-steady-state-ui-era24", () => {
  it("returns null when engineering terminus inactive", () => {
    expect(buildPostTerminusSteadyStateUiSlice({ engineeringTerminusActive: false })).toBeNull();
  });

  it("builds slice with tracks when terminus active locally", () => {
    const slice = buildPostTerminusSteadyStateUiSlice({ engineeringTerminusActive: true, env: {} });
    expect(slice).not.toBeNull();
    expect(slice?.tracks).toHaveLength(6);
    expect(slice?.engineeringPathTerminusMilestone).toBeTruthy();
    expect(slice).toHaveProperty("sustainedOpsConvergenceReady");
    expect(slice?.pureOperationalModeTerminusHref).toContain("era25");
    expect(slice?.validateCommand).toBe("npm run ops:validate-steady-state-operator-loop");
    expect(slice?.postEngineeringTerminusOrchestratorCommand).toContain(
      "run-post-terminus-steady-state-post-engineering-terminus-orchestrator",
    );
    expect(slice?.integrityValidateCommand).toContain(
      "validate-post-terminus-steady-state-integrity",
    );
    expect(slice?.validateEngineeringPathTerminusIntegrityCommand).toContain(
      "validate-engineering-path-terminus-integrity",
    );
  });

  it("formats progress label", () => {
    const slice = buildPostTerminusSteadyStateUiSlice({ engineeringTerminusActive: true, env: {} });
    expect(slice).not.toBeNull();
    if (!slice) return;
    expect(formatPostTerminusSteadyStateProgressLabel(slice)).toContain("Steady state");
  });
});

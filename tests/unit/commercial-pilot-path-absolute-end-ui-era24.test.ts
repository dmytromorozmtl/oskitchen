import { describe, expect, it } from "vitest";

import {
  buildCommercialPilotPathAbsoluteEndUiSlice,
  formatCommercialPilotPathAbsoluteEndLabel,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-ui-era24";

describe("commercial-pilot-path-absolute-end-ui-era24", () => {
  it("returns null when steady state inactive", () => {
    expect(buildCommercialPilotPathAbsoluteEndUiSlice({ steadyStateActive: false })).toBeNull();
  });

  it("builds slice with path layers when steady state active", () => {
    const slice = buildCommercialPilotPathAbsoluteEndUiSlice({ steadyStateActive: true, env: {} });
    expect(slice).not.toBeNull();
    expect(slice?.pathLayers).toHaveLength(4);
    expect(slice?.steadyStateMilestone).toBeTruthy();
    expect(slice).toHaveProperty("sustainedOpsConvergenceReady");
    expect(slice?.pureOperationalModeTerminusHref).toContain("era25");
    expect(slice?.productSurfaces).toHaveLength(7);
    expect(slice?.validateCommand).toBe("npm run ops:validate-commercial-pilot-path-absolute-end");
    expect(slice?.postSteadyStateOrchestratorCommand).toContain(
      "run-commercial-pilot-path-absolute-end-post-steady-state-orchestrator",
    );
    expect(slice?.integrityValidateCommand).toContain(
      "validate-commercial-pilot-path-absolute-end-integrity",
    );
    expect(slice?.validatePostTerminusSteadyStateIntegrityCommand).toContain(
      "validate-post-terminus-steady-state-integrity",
    );
  });

  it("formats absolute end label", () => {
    const slice = buildCommercialPilotPathAbsoluteEndUiSlice({ steadyStateActive: true, env: {} });
    expect(slice).not.toBeNull();
    if (!slice) return;
    expect(formatCommercialPilotPathAbsoluteEndLabel(slice)).toContain("absolute end");
  });
});

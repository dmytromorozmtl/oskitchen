import { describe, expect, it } from "vitest";

import {
  buildEngineeringPathTerminusUiSlice,
  formatEngineeringPathTerminusProgressLabel,
} from "@/lib/commercial/engineering-path-terminus-ui-era24";

describe("engineering-path-terminus-ui-era24", () => {
  it("returns null when maintenance mode inactive", () => {
    expect(buildEngineeringPathTerminusUiSlice({ maintenanceModeActive: false })).toBeNull();
  });

  it("builds slice with 16 steps when maintenance mode active", () => {
    const slice = buildEngineeringPathTerminusUiSlice({ maintenanceModeActive: true, env: {} });
    expect(slice).not.toBeNull();
    expect(slice?.steps).toHaveLength(16);
    expect(slice?.validateCommand).toBe("npm run ops:validate-commercial-pilot-path");
    expect(slice?.postMaintenanceModeOrchestratorCommand).toContain(
      "run-engineering-path-terminus-post-maintenance-mode-orchestrator",
    );
    expect(slice?.syncStatusReportCommand).toContain("sync-commercial-pilot-path-status-report");
  });

  it("formats progress label", () => {
    const slice = buildEngineeringPathTerminusUiSlice({ maintenanceModeActive: true, env: {} });
    expect(slice).not.toBeNull();
    if (!slice) return;
    expect(formatEngineeringPathTerminusProgressLabel(slice)).toContain("Engineering path");
    expect(formatEngineeringPathTerminusProgressLabel(slice)).toContain("16");
  });
});

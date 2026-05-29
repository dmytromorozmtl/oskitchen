import { describe, expect, it } from "vitest";

import {
  buildEra25FirstCharterSliceReadinessUiSlice,
  formatEra25FirstCharterSliceReadinessLabel,
} from "@/lib/commercial/era25-first-charter-slice-readiness-ui-era24";

describe("era25-first-charter-slice-readiness-ui-era24", () => {
  it("returns null when charter exit not visible", () => {
    expect(buildEra25FirstCharterSliceReadinessUiSlice({ charterExitVisible: false })).toBeNull();
  });

  it("builds slice when charter exit visible", () => {
    const slice = buildEra25FirstCharterSliceReadinessUiSlice({ charterExitVisible: true, env: {} });
    expect(slice).not.toBeNull();
    expect(slice?.outsideLinearCatalog).toBe(true);
    expect(slice?.postCharterExitOrchestratorCommand).toContain(
      "run-era25-first-charter-slice-readiness-post-charter-exit-orchestrator",
    );
    expect(slice?.era25FirstCharterSliceReadinessMilestone).toBe("charter_exit_blocked");
    expect(slice?.requiredSectionCount).toBe(10);
    expect(slice?.engineeringGates).not.toBeNull();
    expect(slice?.engineeringGates?.era25EngineeringGatesMilestone).toBe(
      "charter_readiness_blocked",
    );
  });

  it("formats readiness label", () => {
    const slice = buildEra25FirstCharterSliceReadinessUiSlice({ charterExitVisible: true, env: {} });
    expect(slice).not.toBeNull();
    if (!slice) return;
    expect(formatEra25FirstCharterSliceReadinessLabel(slice)).toContain("era25 first charter slice");
    expect(formatEra25FirstCharterSliceReadinessLabel(slice)).toContain("10/10 sections missing");
  });
});

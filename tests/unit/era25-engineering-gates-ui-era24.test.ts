import { describe, expect, it } from "vitest";

import {
  buildEra25EngineeringGatesUiSlice,
  formatEra25EngineeringGatesLabel,
} from "@/lib/commercial/era25-engineering-gates-ui-era24";

describe("era25-engineering-gates-ui-era24", () => {
  it("returns null when readiness not visible", () => {
    expect(buildEra25EngineeringGatesUiSlice({ readinessVisible: false })).toBeNull();
  });

  it("builds slice when readiness visible", () => {
    const slice = buildEra25EngineeringGatesUiSlice({ readinessVisible: true, env: {} });
    expect(slice).not.toBeNull();
    expect(slice?.outsideLinearCatalog).toBe(true);
    expect(slice?.postReadinessOrchestratorCommand).toContain(
      "run-era25-engineering-gates-post-readiness-orchestrator",
    );
    expect(slice?.era25EngineeringGatesMilestone).toBe("charter_readiness_blocked");
    expect(slice?.gatesBlocked).toBe(true);
    expect(slice?.firstProductSliceBlueprint).not.toBeNull();
    expect(slice?.firstProductSliceBlueprint?.canonicalSliceName).toBe(
      "owner-daily-briefing-breakthrough",
    );
  });

  it("formats gates label", () => {
    const slice = buildEra25EngineeringGatesUiSlice({ readinessVisible: true, env: {} });
    expect(slice).not.toBeNull();
    if (!slice) return;
    expect(formatEra25EngineeringGatesLabel(slice)).toContain("era25 engineering gates");
    expect(formatEra25EngineeringGatesLabel(slice)).toContain("BLOCKED");
  });
});

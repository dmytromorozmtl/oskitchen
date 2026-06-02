import { beforeAll, describe, expect, it } from "vitest";

import {
  buildEra25FirstProductSliceBlueprintUiSlice,
  formatEra25FirstProductSliceBlueprintLabel,
  type Era25FirstProductSliceBlueprintUiSlice,
} from "@/lib/commercial/era25-first-product-slice-blueprint-ui-era24";

describe("era25-first-product-slice-blueprint-ui-era24", () => {
  let engineeringGatesSlice: Era25FirstProductSliceBlueprintUiSlice | null;

  beforeAll(() => {
    engineeringGatesSlice = buildEra25FirstProductSliceBlueprintUiSlice({
      engineeringGatesVisible: true,
      env: {},
    });
  }, 120_000);
  it("returns null when engineering gates not visible", () => {
    expect(
      buildEra25FirstProductSliceBlueprintUiSlice({ engineeringGatesVisible: false }),
    ).toBeNull();
  });

  it("builds slice when engineering gates visible", () => {
    const slice = engineeringGatesSlice;
    expect(slice).not.toBeNull();
    expect(slice?.outsideLinearCatalog).toBe(true);
    expect(slice?.canonicalSliceName).toBe("owner-daily-briefing-breakthrough");
    expect(slice?.postGatesOrchestratorCommand).toContain(
      "run-era25-first-product-slice-blueprint-post-gates-orchestrator",
    );
    expect(slice?.era25FirstProductSliceBlueprintMilestone).toBe("engineering_gates_blocked");
    expect(slice?.blueprintBlocked).toBe(true);
    expect(slice?.integrityValidateCommand).toContain(
      "validate-era25-first-product-slice-blueprint-integrity",
    );
    expect(slice?.launchWizardHref).toContain(
      "#launch-wizard-era25-first-product-slice-blueprint",
    );
    expect(slice?.ownerDailyBriefingBreakthrough).not.toBeNull();
    expect(slice?.ownerDailyBriefingBreakthrough?.briefingSchemeCount).toBe(5);
  });

  it("formats blueprint label", () => {
    const slice = engineeringGatesSlice;
    expect(slice).not.toBeNull();
    if (!slice) return;
    expect(formatEra25FirstProductSliceBlueprintLabel(slice)).toContain("blueprint");
    expect(formatEra25FirstProductSliceBlueprintLabel(slice)).toContain("BLOCKED");
  });
});

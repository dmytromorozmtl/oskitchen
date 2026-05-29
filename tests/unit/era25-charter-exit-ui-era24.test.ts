import { describe, expect, it } from "vitest";

import {
  buildEra25CharterExitUiSlice,
  formatEra25CharterExitLabel,
} from "@/lib/commercial/era25-charter-exit-ui-era24";

describe("era25-charter-exit-ui-era24", () => {
  it("returns null when guard not passed", () => {
    expect(buildEra25CharterExitUiSlice({ guardPassed: false })).toBeNull();
  });

  it("builds slice when guard passed", () => {
    const slice = buildEra25CharterExitUiSlice({ guardPassed: true, env: {} });
    expect(slice).not.toBeNull();
    expect(slice?.outsideLinearCatalog).toBe(true);
    expect(slice?.postTerminusGuardOrchestratorCommand).toContain(
      "run-era25-charter-exit-post-terminus-guard-orchestrator",
    );
    expect(slice?.integrityValidateCommand).toBe(
      "npm run ops:validate-era25-charter-exit-outside-linear-path-integrity -- --json",
    );
    expect(slice?.launchWizardHref).toContain("#launch-wizard-era25-charter-exit");
    expect(slice?.era25CharterExitMilestone).toBe("terminus_guard_blocked");
    expect(slice?.firstCharterSliceReadiness).not.toBeNull();
    expect(slice?.firstCharterSliceReadiness?.requiredSectionCount).toBe(10);
  });

  it("formats charter exit label", () => {
    const slice = buildEra25CharterExitUiSlice({ guardPassed: true, env: {} });
    expect(slice).not.toBeNull();
    if (!slice) return;
    expect(formatEra25CharterExitLabel(slice)).toContain("outside linear path");
    expect(formatEra25CharterExitLabel(slice)).toContain("terminus guard blocked");
  });
});

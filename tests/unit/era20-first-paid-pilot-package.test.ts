import { describe, expect, it } from "vitest";

import {
  buildEra20ProspectPlaceholder,
  getEra20PilotSegmentProfile,
  isEra20PilotModuleExcluded,
  isEra20PilotModuleIncluded,
} from "@/lib/commercial/era20-first-paid-pilot-package";

describe("era20 first paid pilot package", () => {
  it("resolves ghost kitchen segment profile", () => {
    const profile = getEra20PilotSegmentProfile("ghost_kitchen");
    expect(profile?.label).toContain("Ghost");
    expect(profile?.launchWizardPriority).toContain("kds");
  });

  it("includes order hub and excludes production sso", () => {
    expect(isEra20PilotModuleIncluded("order_hub")).toBe(true);
    expect(isEra20PilotModuleExcluded("production_sso_all_staff")).toBe(true);
  });

  it("builds prospect placeholder without satisfying customer gate", () => {
    const prospect = buildEra20ProspectPlaceholder("Acme (prospect)");
    expect(prospect?.satisfiesCustomerGate).toBe(false);
    expect(prospect?.disclaimer).toContain("PROSPECT ONLY");
  });

  it("returns null prospect when name empty", () => {
    expect(buildEra20ProspectPlaceholder("  ")).toBeNull();
  });
});

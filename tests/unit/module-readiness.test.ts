import { describe, expect, it } from "vitest";

import { getFilteredNavGroups } from "@/lib/business-modes";
import {
  effectiveDisabledModuleKeysFromRows,
  getModuleReadinessForPath,
  getReadinessDefaultDisabledModuleKeys,
  listPilotOnlyReadinessIds,
  moduleReadinessBadgeLabel,
} from "@/lib/product/module-readiness";

describe("module readiness mapping", () => {
  it("maps major dashboard routes to configured readiness states", () => {
    expect(getModuleReadinessForPath("/dashboard/copilot")).toMatchObject({
      id: "copilot",
      status: "PILOT_ONLY",
    });
    expect(getModuleReadinessForPath("/dashboard/food-safety")).toMatchObject({
      id: "food_safety",
      status: "PILOT_ONLY",
    });
    expect(getModuleReadinessForPath("/dashboard/pos")).toMatchObject({
      id: "pos",
      status: "BETA",
    });
    expect(getModuleReadinessForPath("/dashboard/settings/white-label")).toMatchObject({
      id: "white_label",
      status: "PILOT_ONLY",
    });
  });

  it("returns badge labels only for non-GA modules", () => {
    expect(moduleReadinessBadgeLabel("GA")).toBeNull();
    expect(moduleReadinessBadgeLabel("BETA")).toBe("Beta");
    expect(moduleReadinessBadgeLabel("PILOT_ONLY")).toBe("Pilot");
    expect(moduleReadinessBadgeLabel("INTERNAL")).toBe("Internal");
    expect(moduleReadinessBadgeLabel("HIDDEN")).toBe("Hidden");
  });

  it("defaults pilot-only modules to disabled until a workspace explicitly enables them", () => {
    const defaults = getReadinessDefaultDisabledModuleKeys();
    expect(defaults.has("copilot")).toBe(true);
    expect(defaults.has("food_safety")).toBe(true);

    const effective = effectiveDisabledModuleKeysFromRows([]);
    expect(effective.has("copilot")).toBe(true);
    expect(effective.has("food_safety")).toBe(true);

    const withoutEnrollment = effectiveDisabledModuleKeysFromRows([
      { moduleKey: "copilot", enabled: true },
      { moduleKey: "food_safety", enabled: true },
    ]);
    expect(withoutEnrollment.has("copilot")).toBe(true);
    expect(withoutEnrollment.has("food_safety")).toBe(true);

    const enrolled = new Set(["copilot", "food_safety"]);
    const optedIn = effectiveDisabledModuleKeysFromRows(
      [
        { moduleKey: "copilot", enabled: true },
        { moduleKey: "food_safety", enabled: true },
      ],
      enrolled,
    );
    expect(optedIn.has("copilot")).toBe(false);
    expect(optedIn.has("food_safety")).toBe(false);
  });

  it("removes disabled pilot modules from all-modules navigation until explicit opt-in", () => {
    const defaultDisabled = effectiveDisabledModuleKeysFromRows([]);
    const groupsBlocked = getFilteredNavGroups(
      {
        businessType: "MEAL_PREP",
        navScopeAll: true,
        fullNavAccess: false,
        isOwner: true,
      },
      { disabledModuleKeys: defaultDisabled },
    );
    const blockedHrefs = groupsBlocked.flatMap((group) => group.links.map((link) => link.href));
    expect(blockedHrefs.some((href) => href.startsWith("/dashboard/copilot"))).toBe(false);
    expect(blockedHrefs.some((href) => href.startsWith("/dashboard/food-safety"))).toBe(false);

    const groupsEnabled = getFilteredNavGroups(
      {
        businessType: "MEAL_PREP",
        navScopeAll: true,
        fullNavAccess: false,
        isOwner: true,
      },
      {
        disabledModuleKeys: effectiveDisabledModuleKeysFromRows(
          [
            { moduleKey: "copilot", enabled: true },
            { moduleKey: "food_safety", enabled: true },
          ],
          new Set(["copilot", "food_safety"]),
        ),
      },
    );
    const enabledHrefs = groupsEnabled.flatMap((group) => group.links.map((link) => link.href));
    expect(enabledHrefs.some((href) => href.startsWith("/dashboard/copilot"))).toBe(true);
    expect(enabledHrefs.some((href) => href.startsWith("/dashboard/food-safety"))).toBe(true);
  });

  it("surfaces the pilot-only readiness ids used for workspace enrollment", () => {
    expect(listPilotOnlyReadinessIds()).toEqual(
      expect.arrayContaining(["accounting", "copilot", "food_safety", "white_label"]),
    );
  });
});

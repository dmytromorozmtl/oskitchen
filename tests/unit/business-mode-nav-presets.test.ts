import { describe, expect, it } from "vitest";

import { getFilteredNavGroups } from "@/lib/business-modes";
import { getBusinessModeExperience } from "@/lib/business-mode-registry";

const MODES = ["MEAL_PREP", "CATERING", "GHOST_KITCHEN"] as const;

describe("business-mode nav presets (launch matrix)", () => {
  for (const mode of MODES) {
    it(`${mode}: focused nav hides advanced modules`, () => {
      const hidden = getBusinessModeExperience(mode).hiddenByDefaultModuleKeys;
      expect(hidden.length).toBeGreaterThan(0);

      const focused = getFilteredNavGroups({
        businessType: mode,
        navScopeAll: false,
        fullNavAccess: false,
        isOwner: true,
      });
      const hrefs = focused.flatMap((g) => g.links.map((l) => l.href));
      expect(hrefs.some((h) => h.includes("/dashboard/implementation"))).toBe(false);
    });

    it(`${mode}: show-all exposes more links than focused`, () => {
      const focusedCount = getFilteredNavGroups({
        businessType: mode,
        navScopeAll: false,
        fullNavAccess: false,
        isOwner: true,
      }).flatMap((g) => g.links).length;

      const allCount = getFilteredNavGroups({
        businessType: mode,
        navScopeAll: true,
        fullNavAccess: false,
        isOwner: true,
      }).flatMap((g) => g.links).length;

      expect(allCount).toBeGreaterThanOrEqual(focusedCount);
    });
  }
});

import { describe, expect, it } from "vitest";

import { NAV_MATURITY_RULES } from "@/lib/navigation/nav-maturity-governance";
import {
  PAGE_MATURITY_SWEEP_POLICY_ID,
  PAGE_MATURITY_INLINE_HONESTY_ROUTES,
} from "@/lib/navigation/page-maturity-sweep-policy";

describe("page maturity sweep policy", () => {
  it("locks era4 page maturity sweep policy id", () => {
    expect(PAGE_MATURITY_SWEEP_POLICY_ID).toBe("era4-page-maturity-sweep-v1");
  });

  it("aligns inline honesty exceptions with uber-direct nav rules", () => {
    for (const route of PAGE_MATURITY_INLINE_HONESTY_ROUTES) {
      if (!route.includes("uber-direct")) continue;
      const rule = NAV_MATURITY_RULES.find((r) => r.prefix === route);
      expect(rule?.exposure, route).toBe("preview");
    }
  });

  it("classifies core preview leaf routes in NAV_MATURITY_RULES", () => {
    const previewPrefixes = [
      "/dashboard/pos/tabs",
      "/dashboard/pos/handheld",
      "/dashboard/tables",
      "/dashboard/copilot",
      "/dashboard/forecast",
      "/dashboard/food-safety",
      "/dashboard/storefront/reservations",
    ];
    for (const prefix of previewPrefixes) {
      const rule = NAV_MATURITY_RULES.find((r) => r.prefix === prefix);
      expect(rule?.exposure, prefix).toBe("preview");
    }
  });
});

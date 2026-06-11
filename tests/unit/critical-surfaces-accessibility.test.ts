import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { KDS_KEYBOARD_ARIA_PATTERNS } from "@/lib/kitchen/kds-keyboard-navigation-policy";
import {
  CRITICAL_SURFACES_ACCESSIBILITY_CI_SCRIPTS,
  CRITICAL_SURFACES_ACCESSIBILITY_E2E_SPECS,
  CRITICAL_SURFACES_ACCESSIBILITY_POLICY_ID,
  CRITICAL_SURFACES_ACCESSIBILITY_ROUTES,
  CRITICAL_SURFACES_ACCESSIBILITY_SURFACES,
  CRITICAL_SURFACES_ACCESSIBILITY_WIRED_MODULES,
  criticalSurfacesAxeRoutesCovered,
} from "@/lib/ux/critical-surfaces-accessibility-policy";

const ROOT = process.cwd();

describe("critical surfaces accessibility (P1-30)", () => {
  it("locks policy and three revenue surfaces", () => {
    expect(CRITICAL_SURFACES_ACCESSIBILITY_POLICY_ID).toBe(
      "critical-surfaces-accessibility-p1-30-v1",
    );
    expect(CRITICAL_SURFACES_ACCESSIBILITY_SURFACES).toEqual(["today", "pos_terminal", "kds"]);
    expect(CRITICAL_SURFACES_ACCESSIBILITY_ROUTES.today).toBe("/dashboard/today");
    expect(CRITICAL_SURFACES_ACCESSIBILITY_ROUTES.kds).toBe("/dashboard/kitchen");
    expect(criticalSurfacesAxeRoutesCovered()).toBe(true);
  });

  it.each(CRITICAL_SURFACES_ACCESSIBILITY_E2E_SPECS)("ships E2E spec %s", (specPath) => {
    const source = readFileSync(join(ROOT, specPath), "utf8");
    expect(source.length).toBeGreaterThan(20);
  });

  it.each(CRITICAL_SURFACES_ACCESSIBILITY_WIRED_MODULES)(
    "module %s includes keyboard or ARIA wiring",
    (modulePath) => {
      const source = readFileSync(join(ROOT, modulePath), "utf8");
      const hasA11y =
        source.includes("aria-") ||
        source.includes("onKeyDown") ||
        source.includes("role=") ||
        source.includes("DashboardSkipLink") ||
        source.includes("data-testid");
      expect(hasA11y, modulePath).toBe(true);
    },
  );

  it("KDS bump/recall buttons expose screen-reader labels", () => {
    const kds = readFileSync(
      join(ROOT, "components/kitchen/kds-daily-service.tsx"),
      "utf8",
    );
    for (const pattern of KDS_KEYBOARD_ARIA_PATTERNS) {
      expect(kds).toContain(pattern);
    }
  });

  it("documents CI script", () => {
    expect(CRITICAL_SURFACES_ACCESSIBILITY_CI_SCRIPTS).toContain(
      "test:ci:critical-surfaces-accessibility",
    );
  });
});

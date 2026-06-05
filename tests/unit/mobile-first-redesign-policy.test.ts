import { describe, expect, it } from "vitest";

import {
  auditMobileFirstRedesign,
  findMobileFirstSmButtonViolations,
} from "@/lib/design/mobile-first-redesign-audit-policy";
import {
  MOBILE_FIRST_REDESIGN_POLICY_ID,
  MOBILE_FIRST_TOUCH_FLOOR_PX,
  MOBILE_FIRST_VIEWPORT_PX,
} from "@/lib/design/mobile-first-redesign-policy";
import {
  createDashboardSwipeHandlers,
  dashboardChromeButtonClass,
  dashboardChromeNavTriggerClass,
  dashboardNavPillClass,
} from "@/lib/design/mobile-first-redesign-patterns";
import { loadMobileFirstRedesignSnapshot } from "@/services/design/mobile-first-redesign-service";

describe("mobile-first redesign policy (DES-25)", () => {
  it("locks 375px viewport and 44px touch floor", () => {
    expect(MOBILE_FIRST_REDESIGN_POLICY_ID).toBe("mobile-first-redesign-des25-v1");
    expect(MOBILE_FIRST_VIEWPORT_PX).toBe(375);
    expect(MOBILE_FIRST_TOUCH_FLOOR_PX).toBe(44);
    expect(dashboardChromeButtonClass).toContain("min-h-11");
    expect(dashboardChromeNavTriggerClass).toContain("min-h-11");
    expect(dashboardNavPillClass).toContain("min-h-11");
  });

  it("flags size=sm buttons without touch floor", () => {
    const violations = findMobileFirstSmButtonViolations(`
      <Button variant="outline" size="sm" className="rounded-full" />
      <Button size="sm" className="min-h-11 rounded-full" />
      <Button variant="link" size="sm" className="h-auto p-0" />
    `);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.pattern).toBe("button-size-sm-without-touch-floor");
  });

  it("wires swipe-left handler for nav drawer dismiss", () => {
    let closed = false;
    const handlers = createDashboardSwipeHandlers({ onSwipeLeft: () => { closed = true; } });
    expect(handlers.touchAction).toBe("pan-y");
    expect(typeof handlers.onPointerDown).toBe("function");
    expect(closed).toBe(false);
  });

  it("passes audit on operator chrome surfaces", () => {
    const report = auditMobileFirstRedesign();
    expect(report.passed).toBe(true);
    expect(report.modules.every((m) => m.passed)).toBe(true);
  });

  it("loads redesign snapshot with full health score", () => {
    const snapshot = loadMobileFirstRedesignSnapshot();
    expect(snapshot.healthScore).toBe(100);
    expect(snapshot.passed).toBe(true);
    expect(snapshot.passedModuleCount).toBe(snapshot.moduleCount);
  });
});

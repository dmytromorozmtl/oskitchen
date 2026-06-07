import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  meetsTouchTargetFloor,
  MOBILE_TOUCH_TARGET_44PX_CI_SCRIPTS,
  MOBILE_TOUCH_TARGET_44PX_POLICY_ID,
  MOBILE_TOUCH_TARGET_44PX_SPEC_PATH,
  MOBILE_TOUCH_TARGET_DASHBOARD_SURFACES,
  MOBILE_TOUCH_TARGET_FLOOR_PX,
  MOBILE_TOUCH_TARGET_POS_SURFACES,
  MOBILE_TOUCH_TARGET_VIEWPORT,
  mobileTouchTargetSurfaceCount,
  touchTargetViolationMessage,
} from "@/lib/accessibility/mobile-touch-target-44px-policy";
import { auditMobileFirstRedesign } from "@/lib/design/mobile-first-redesign-audit-policy";
import { POS_WCAG_FLOOR_PX } from "@/lib/pos/touch-targets";

const ROOT = process.cwd();

describe("mobile touch target 44px (Absolute Final Task 49)", () => {
  it("locks 375px viewport and 44px WCAG floor", () => {
    expect(MOBILE_TOUCH_TARGET_44PX_POLICY_ID).toBe(
      "mobile-touch-target-44px-absolute-final-v1",
    );
    expect(MOBILE_TOUCH_TARGET_FLOOR_PX).toBe(44);
    expect(POS_WCAG_FLOOR_PX).toBe(44);
    expect(MOBILE_TOUCH_TARGET_VIEWPORT).toEqual({ width: 375, height: 812 });
    expect(mobileTouchTargetSurfaceCount()).toBe(5);
    expect(MOBILE_TOUCH_TARGET_DASHBOARD_SURFACES).toHaveLength(3);
    expect(MOBILE_TOUCH_TARGET_POS_SURFACES).toHaveLength(2);
  });

  it("evaluates bounding boxes against touch floor", () => {
    expect(meetsTouchTargetFloor({ width: 44, height: 44 })).toBe(true);
    expect(meetsTouchTargetFloor({ width: 48, height: 48 })).toBe(true);
    expect(meetsTouchTargetFloor({ width: 40, height: 48 })).toBe(false);
    expect(touchTargetViolationMessage("nav", { width: 40, height: 48 })).toContain("< 44px");
    expect(touchTargetViolationMessage("nav", { width: 48, height: 48 })).toBeNull();
  });

  it("mobile-first redesign audit still passes before E2E measurement", () => {
    expect(auditMobileFirstRedesign(ROOT).passed).toBe(true);
  });

  it("ships Playwright spec, helper, and npm scripts", () => {
    const spec = readFileSync(join(ROOT, MOBILE_TOUCH_TARGET_44PX_SPEC_PATH), "utf8");
    expect(spec).toContain("mobile touch targets — 44px floor");
    expect(spec).toContain("expectLocatorMeetsTouchTargetFloor");

    const helper = readFileSync(join(ROOT, "e2e/helpers/touch-target-assertions.ts"), "utf8");
    expect(helper).toContain("boundingBox");

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of MOBILE_TOUCH_TARGET_44PX_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }

    const playwrightConfig = readFileSync(join(ROOT, "playwright.config.ts"), "utf8");
    expect(playwrightConfig).toContain("mobile-touch-target-44px.spec.ts");
  });
});

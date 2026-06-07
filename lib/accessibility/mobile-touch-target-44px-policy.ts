/**
 * Absolute Final Task 49 — mobile touch target 44px validation.
 */

import { MOBILE_FIRST_TOUCH_FLOOR_PX } from "@/lib/design/mobile-first-redesign-policy";
import { POS_WCAG_FLOOR_PX } from "@/lib/pos/touch-targets";
import { POS_TERMINAL_KEYBOARD_NAVIGATION_ROUTE } from "@/lib/pos/pos-terminal-keyboard-navigation-policy";

export const MOBILE_TOUCH_TARGET_44PX_POLICY_ID =
  "mobile-touch-target-44px-absolute-final-v1" as const;

export const MOBILE_TOUCH_TARGET_FLOOR_PX = MOBILE_FIRST_TOUCH_FLOOR_PX;

export const MOBILE_TOUCH_TARGET_VIEWPORT = {
  width: 375,
  height: 812,
} as const;

export const MOBILE_TOUCH_TARGET_44PX_SPEC_PATH =
  "e2e/mobile-touch-target-44px.spec.ts" as const;

export const MOBILE_TOUCH_TARGET_44PX_CI_SCRIPTS = [
  "test:ci:mobile-touch-target-44px",
  "test:e2e:mobile-touch-target-44px",
] as const;

export type MobileTouchTargetSurface = {
  id: string;
  route: string;
  kind: "role" | "testid";
  role?: "button";
  name?: string;
  testId?: string;
  description: string;
};

export const MOBILE_TOUCH_TARGET_DASHBOARD_SURFACES: readonly MobileTouchTargetSurface[] = [
  {
    id: "dashboard_nav_trigger",
    route: "/dashboard/today",
    kind: "testid",
    testId: "dashboard-nav-trigger",
    description: "Navigation drawer trigger in dashboard shell",
  },
  {
    id: "dashboard_account_menu",
    route: "/dashboard/today",
    kind: "role",
    role: "button",
    name: "Open account menu",
    description: "Account menu icon button",
  },
  {
    id: "dashboard_theme_toggle",
    route: "/dashboard/today",
    kind: "role",
    role: "button",
    name: "Toggle theme",
    description: "Theme toggle with sr-only label",
  },
] as const;

export const MOBILE_TOUCH_TARGET_POS_SURFACES: readonly MobileTouchTargetSurface[] = [
  {
    id: "pos_product_tile",
    route: POS_TERMINAL_KEYBOARD_NAVIGATION_ROUTE,
    kind: "testid",
    testId: "pos-product-tile",
    description: "Primary product tile tap target",
  },
  {
    id: "pos_complete_sale",
    route: POS_TERMINAL_KEYBOARD_NAVIGATION_ROUTE,
    kind: "testid",
    testId: "pos-complete-sale",
    description: "Checkout CTA on cart panel",
  },
] as const;

export const MOBILE_TOUCH_TARGET_POS_WCAG_FLOOR_PX = POS_WCAG_FLOOR_PX;

export function mobileTouchTargetSurfaceCount(): number {
  return (
    MOBILE_TOUCH_TARGET_DASHBOARD_SURFACES.length + MOBILE_TOUCH_TARGET_POS_SURFACES.length
  );
}

export type TouchTargetBox = {
  width: number;
  height: number;
};

export function meetsTouchTargetFloor(
  box: TouchTargetBox | null | undefined,
  floorPx = MOBILE_TOUCH_TARGET_FLOOR_PX,
): boolean {
  if (!box) return false;
  return box.width >= floorPx && box.height >= floorPx;
}

export function touchTargetViolationMessage(
  id: string,
  box: TouchTargetBox | null | undefined,
  floorPx = MOBILE_TOUCH_TARGET_FLOOR_PX,
): string | null {
  if (!box) return `${id}: element has no layout box`;
  if (box.width < floorPx || box.height < floorPx) {
    return `${id}: ${Math.round(box.width)}×${Math.round(box.height)}px < ${floorPx}px floor`;
  }
  return null;
}

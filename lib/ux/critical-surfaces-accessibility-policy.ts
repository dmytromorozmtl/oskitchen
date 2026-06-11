/**
 * Blueprint P1-30 — keyboard navigation + screen reader audit on POS, KDS, Today.
 */

import { E2E_ACCESSIBILITY_AXE_DASHBOARD_ROUTES } from "@/lib/accessibility/e2e-accessibility-axe-policy";
import { SCREEN_READER_ICON_BUTTON_SPEC_PATH } from "@/lib/accessibility/screen-reader-icon-button-policy";
import {
  DASHBOARD_MAIN_LANDMARK_ID,
  DASHBOARD_SKIP_LINK_LABEL,
  SKIP_LINK_MAIN_LANDMARK_POLICY_ID,
} from "@/lib/accessibility/skip-link-main-landmark-policy";
import { TODAY_KEYBOARD_NAVIGATION_POLICY_ID } from "@/lib/accessibility/today-keyboard-navigation-policy";
import { KDS_KEYBOARD_NAVIGATION_POLICY_ID } from "@/lib/kitchen/kds-keyboard-navigation-policy";
import { POS_TERMINAL_KEYBOARD_NAVIGATION_POLICY_ID } from "@/lib/pos/pos-terminal-keyboard-navigation-policy";

export const CRITICAL_SURFACES_ACCESSIBILITY_POLICY_ID =
  "critical-surfaces-accessibility-p1-30-v1" as const;

export const CRITICAL_SURFACES_ACCESSIBILITY_SURFACES = [
  "today",
  "pos_terminal",
  "kds",
] as const;

export type CriticalSurfaceAccessibilitySurface =
  (typeof CRITICAL_SURFACES_ACCESSIBILITY_SURFACES)[number];

export const CRITICAL_SURFACES_ACCESSIBILITY_ROUTES = {
  today: "/dashboard/today",
  pos_terminal: "/dashboard/pos/terminal?speed=0",
  kds: "/dashboard/kitchen",
} as const satisfies Record<CriticalSurfaceAccessibilitySurface, string>;

export const CRITICAL_SURFACES_ACCESSIBILITY_UPSTREAM_POLICIES = [
  SKIP_LINK_MAIN_LANDMARK_POLICY_ID,
  POS_TERMINAL_KEYBOARD_NAVIGATION_POLICY_ID,
  KDS_KEYBOARD_NAVIGATION_POLICY_ID,
  TODAY_KEYBOARD_NAVIGATION_POLICY_ID,
  "screen-reader-icon-button-absolute-final-v1",
] as const;

export const CRITICAL_SURFACES_ACCESSIBILITY_E2E_SPECS = [
  "e2e/pos-terminal-keyboard-navigation.spec.ts",
  "e2e/kds-keyboard-navigation.spec.ts",
  "e2e/today-keyboard-navigation.spec.ts",
  SCREEN_READER_ICON_BUTTON_SPEC_PATH,
  "e2e/dashboard-accessibility-axe.spec.ts",
] as const;

export const CRITICAL_SURFACES_ACCESSIBILITY_WIRED_MODULES = [
  "components/dashboard/dashboard-shell.tsx",
  "components/a11y/dashboard-skip-link.tsx",
  "components/dashboard/pos-terminal-client.tsx",
  "components/kitchen/kds-daily-service.tsx",
  "components/kitchen/kds-bump-next-strip.tsx",
  "components/kitchen/kds-ticket-row-next-action.tsx",
] as const;

export const CRITICAL_SURFACES_ACCESSIBILITY_AXE_ROUTES = [
  CRITICAL_SURFACES_ACCESSIBILITY_ROUTES.today,
  CRITICAL_SURFACES_ACCESSIBILITY_ROUTES.pos_terminal.split("?")[0]!,
  CRITICAL_SURFACES_ACCESSIBILITY_ROUTES.kds,
] as const;

export const CRITICAL_SURFACES_ACCESSIBILITY_CI_SCRIPTS = [
  "test:ci:critical-surfaces-accessibility",
] as const;

/** Today skip link label reused from dashboard shell policy. */
export { DASHBOARD_SKIP_LINK_LABEL, DASHBOARD_MAIN_LANDMARK_ID };

export function criticalSurfacesAxeRoutesCovered(): boolean {
  return CRITICAL_SURFACES_ACCESSIBILITY_AXE_ROUTES.every((route) =>
    (E2E_ACCESSIBILITY_AXE_DASHBOARD_ROUTES as readonly string[]).includes(route),
  );
}

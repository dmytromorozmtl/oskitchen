/**
 * Blueprint P1-30 — Today keyboard navigation (skip link, main landmark, shell controls).
 */

import {
  DASHBOARD_MAIN_LANDMARK_ARIA_LABEL,
  DASHBOARD_MAIN_LANDMARK_ID,
  DASHBOARD_SKIP_LINK_LABEL,
} from "@/lib/accessibility/skip-link-main-landmark-policy";

export const TODAY_KEYBOARD_NAVIGATION_POLICY_ID = "today-keyboard-navigation-p1-30-v1" as const;

export const TODAY_KEYBOARD_NAVIGATION_ROUTE = "/dashboard/today" as const;

export const TODAY_KEYBOARD_NAVIGATION_SPEC_PATH = "e2e/today-keyboard-navigation.spec.ts" as const;

export const TODAY_KEYBOARD_NAVIGATION_CI_SCRIPTS = [
  "test:ci:today-keyboard-navigation",
  "test:e2e:today-keyboard",
] as const;

export const TODAY_KEYBOARD_TEST_IDS = {
  skipLink: "dashboard-skip-link",
  mainLandmark: DASHBOARD_MAIN_LANDMARK_ID,
} as const;

export const TODAY_KEYBOARD_NAVIGATION_FLOWS = [
  { id: "skip_to_main", label: DASHBOARD_SKIP_LINK_LABEL },
  { id: "main_landmark", label: DASHBOARD_MAIN_LANDMARK_ARIA_LABEL },
  { id: "nav_drawer", label: "Open navigation menu" },
  { id: "account_menu", label: "Open account menu" },
] as const;

export { DASHBOARD_MAIN_LANDMARK_ID, DASHBOARD_SKIP_LINK_LABEL, DASHBOARD_MAIN_LANDMARK_ARIA_LABEL };

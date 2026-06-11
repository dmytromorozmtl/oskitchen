/**
 * Absolute Final Task 48 — screen reader tests for icon-only buttons.
 */

import {
  posTerminalDecreaseQuantityLabel,
  posTerminalIncreaseQuantityLabel,
} from "@/lib/pos/pos-terminal-icon-button-labels";
import { POS_TERMINAL_KEYBOARD_NAVIGATION_ROUTE } from "@/lib/pos/pos-terminal-keyboard-navigation-policy";

export const SCREEN_READER_ICON_BUTTON_POLICY_ID =
  "screen-reader-icon-button-absolute-final-v1" as const;

export const SCREEN_READER_ICON_BUTTON_SPEC_PATH =
  "e2e/screen-reader-icon-buttons.spec.ts" as const;

export const SCREEN_READER_ICON_BUTTON_CI_SCRIPTS = [
  "test:ci:screen-reader-icon-buttons",
  "test:e2e:screen-reader-icon-buttons",
] as const;

export type ScreenReaderIconButtonExpectation = {
  id: string;
  route: string;
  accessibleName: string;
  description: string;
};

/** Static icon-only controls discoverable via role + accessible name (screen reader parity). */
export const SCREEN_READER_STATIC_ICON_BUTTONS: readonly ScreenReaderIconButtonExpectation[] = [
  {
    id: "dashboard_nav_menu",
    route: "/dashboard/today",
    accessibleName: "Open navigation menu",
    description: "Mobile/tablet nav drawer trigger in dashboard shell",
  },
  {
    id: "dashboard_account_menu",
    route: "/dashboard/today",
    accessibleName: "Open account menu",
    description: "Account dropdown trigger in dashboard shell",
  },
  {
    id: "dashboard_theme_toggle",
    route: "/dashboard/today",
    accessibleName: "Toggle theme",
    description: "Theme toggle uses sr-only text inside icon button",
  },
  {
    id: "kds_sound_alerts_on",
    route: "/dashboard/kitchen",
    accessibleName: "Disable kitchen sound alerts",
    description: "KDS sound toggle when alerts are enabled",
  },
  {
    id: "kds_sound_alerts_off",
    route: "/dashboard/kitchen",
    accessibleName: "Enable kitchen sound alerts",
    description: "KDS sound toggle when alerts are disabled",
  },
  {
    id: "pos_welcome_dismiss",
    route: `${POS_TERMINAL_KEYBOARD_NAVIGATION_ROUTE}&welcome=true`,
    accessibleName: "Dismiss",
    description: "POS welcome banner dismiss control",
  },
  {
    id: "pos_shortcuts_close",
    route: POS_TERMINAL_KEYBOARD_NAVIGATION_ROUTE,
    accessibleName: "Close shortcuts",
    description: "Desktop POS keyboard shortcuts overlay",
  },
] as const;

export const SCREEN_READER_STATIC_ICON_BUTTON_COUNT =
  SCREEN_READER_STATIC_ICON_BUTTONS.length;

export const SCREEN_READER_DYNAMIC_POS_CART_BUTTONS = {
  route: POS_TERMINAL_KEYBOARD_NAVIGATION_ROUTE,
  decreaseLabel: posTerminalDecreaseQuantityLabel,
  increaseLabel: posTerminalIncreaseQuantityLabel,
} as const;

export function extractAccessibleNameFromButtonSnippet(snippet: string): string | null {
  const ariaMatch = snippet.match(/aria-label=\{?["'`]([^"'`}]+)["'`]\}?/);
  if (ariaMatch?.[1]) return ariaMatch[1].trim();

  const ariaJsMatch = snippet.match(/aria-label=\{([^}]+)\}/);
  if (ariaJsMatch?.[1]?.includes("posTerminal")) return "__dynamic__";

  const srOnlyMatch = snippet.match(/className="sr-only">([^<]+)</);
  if (srOnlyMatch?.[1]) return srOnlyMatch[1].trim();

  return null;
}

export function iconButtonSnippetHasAccessibleName(snippet: string): boolean {
  const name = extractAccessibleNameFromButtonSnippet(snippet);
  return name != null && name.length > 0;
}

export function screenReaderStaticButtonNames(): string[] {
  return SCREEN_READER_STATIC_ICON_BUTTONS.map((row) => row.accessibleName);
}

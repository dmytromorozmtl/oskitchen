/**
 * Absolute Final Task 47 — POS terminal keyboard navigation E2E tests.
 */

import { POS_DESKTOP_TERMINAL_ROUTE } from "@/lib/pos/pos-desktop-shortcuts-policy";

export const POS_TERMINAL_KEYBOARD_NAVIGATION_POLICY_ID =
  "pos-terminal-keyboard-navigation-absolute-final-v1" as const;

/** Desktop layout required — speed mode disables global shortcut listener. */
export const POS_TERMINAL_KEYBOARD_NAVIGATION_ROUTE =
  `${POS_DESKTOP_TERMINAL_ROUTE}?speed=0` as const;

export const POS_TERMINAL_KEYBOARD_NAVIGATION_SPEC_PATH =
  "e2e/pos-terminal-keyboard-navigation.spec.ts" as const;

export const POS_TERMINAL_KEYBOARD_NAVIGATION_HELPER_PATH =
  "e2e/helpers/pos-terminal-keyboard-navigation.ts" as const;

export const POS_TERMINAL_KEYBOARD_NAVIGATION_CI_SCRIPTS = [
  "test:ci:pos-terminal-keyboard-navigation",
  "test:e2e:pos-terminal-keyboard",
] as const;

export type PosTerminalKeyboardFlow = {
  id: string;
  key: string;
  label: string;
};

/** Counter-terminal keyboard flows exercised in Playwright. */
export const POS_TERMINAL_KEYBOARD_NAVIGATION_FLOWS: readonly PosTerminalKeyboardFlow[] = [
  { id: "focus_product_search", key: "F1", label: "Focus product search" },
  { id: "show_shortcuts_overlay", key: "F9", label: "Open shortcuts overlay" },
  { id: "focus_customer_search", key: "F7", label: "Focus customer search" },
  { id: "quick_add_first_product", key: "1", label: "Quick-add first visible product" },
  { id: "increment_last_line", key: "+", label: "Increase last cart line quantity" },
  { id: "clear_cart", key: "Escape", label: "Clear cart" },
  { id: "payment_cash", key: "F3", label: "Select cash payment" },
  { id: "tab_from_search", key: "Tab", label: "Move focus from product search" },
] as const;

export const POS_TERMINAL_KEYBOARD_NAVIGATION_FLOW_COUNT =
  POS_TERMINAL_KEYBOARD_NAVIGATION_FLOWS.length;

export const POS_TERMINAL_KEYBOARD_TEST_IDS = {
  productSearch: "pos-product-search",
  customerQuery: "pos-customer-query",
  shortcutsOverlay: "pos-desktop-shortcuts-overlay",
  paymentPanel: "pos-payment-panel",
  productTile: "pos-product-tile",
} as const;

export function posTerminalKeyboardFlowIds(): string[] {
  return POS_TERMINAL_KEYBOARD_NAVIGATION_FLOWS.map((flow) => flow.id);
}

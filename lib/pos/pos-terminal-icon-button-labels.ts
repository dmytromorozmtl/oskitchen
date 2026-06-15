/**
 * DES-35 — accessible labels for POS terminal icon-only controls.
 */

export const POS_TERMINAL_ICON_BUTTON_LABELS_POLICY_ID =
  "pos-terminal-icon-button-labels-des35-v1" as const;

export function posTerminalDecreaseQuantityLabel(itemTitle: string): string {
  return `Decrease quantity for ${itemTitle}`;
}

export function posTerminalIncreaseQuantityLabel(itemTitle: string): string {
  return `Increase quantity for ${itemTitle}`;
}

export const POS_TERMINAL_ICON_BUTTON_MODULES = [
  "components/dashboard/pos-terminal/cart-panel.tsx",
  "components/dashboard/pos-terminal-client.tsx",
  "components/pos/pos-mobile-client.tsx",
  "components/pos/pos-desktop-shortcuts-overlay.tsx",
  "components/dashboard/pos-welcome-banner.tsx",
] as const;

export type PosTerminalIconButtonModule = (typeof POS_TERMINAL_ICON_BUTTON_MODULES)[number];

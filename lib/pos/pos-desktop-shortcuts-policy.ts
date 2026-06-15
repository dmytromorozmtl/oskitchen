/**
 * Desktop POS — professional keyboard shortcuts and multi-monitor customer display.
 */

export const POS_DESKTOP_SHORTCUTS_POLICY_ID = "pos-desktop-shortcuts-v1" as const;

export const POS_DESKTOP_TERMINAL_ROUTE = "/dashboard/pos/terminal" as const;

export const POS_CUSTOMER_DISPLAY_ROUTE =
  "/dashboard/pos/terminal/customer-display" as const;

export const POS_CUSTOMER_DISPLAY_COMPONENT = "components/pos/customer-display.tsx" as const;

export const POS_DESKTOP_TERMINAL_DOC = "docs/pos-desktop-terminal.md" as const;

export const POS_DESKTOP_SHORTCUTS_MODULE = "lib/keyboard/shortcuts.ts" as const;

export const POS_DESKTOP_MULTI_MONITOR_MODULE = "lib/pos/pos-multi-monitor.ts" as const;

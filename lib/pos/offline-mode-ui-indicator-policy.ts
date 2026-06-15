/**
 * Absolute Final Task 62 — offline mode UI: status bar, queue badge, sync animation.
 *
 * @see components/dashboard/offline-mode-ui-indicator.tsx
 * @see components/dashboard/offline-sync-status-bar.tsx
 * @see components/pwa/offline-indicator.tsx
 */

import { POS_OFFLINE_MODE_E2E_POLICY_ID } from "@/lib/pos/pos-offline-mode-e2e-policy";

export const OFFLINE_MODE_UI_INDICATOR_POLICY_ID =
  "offline-mode-ui-indicator-absolute-final-v1" as const;

export const OFFLINE_MODE_UI_INDICATOR_UPSTREAM_POLICY_ID = POS_OFFLINE_MODE_E2E_POLICY_ID;

export const OFFLINE_MODE_UI_STATUS_BAR_TEST_ID = "offline-mode-ui-status-bar" as const;

export const OFFLINE_MODE_UI_QUEUE_BADGE_TEST_ID = "offline-mode-ui-queue-badge" as const;

export const OFFLINE_MODE_UI_SYNC_ANIMATION_TEST_ID = "offline-mode-ui-sync-animation" as const;

export const OFFLINE_MODE_UI_POS_ROUTE = "/dashboard/pos/terminal" as const;

export const OFFLINE_MODE_UI_INDICATOR_PANEL_PATH =
  "components/dashboard/offline-mode-ui-indicator.tsx" as const;

export const OFFLINE_MODE_UI_STATUS_BAR_PATH =
  "components/dashboard/offline-sync-status-bar.tsx" as const;

export const OFFLINE_MODE_UI_GLOBAL_INDICATOR_PATH = "components/pwa/offline-indicator.tsx" as const;

export const OFFLINE_MODE_UI_SHELL_PATH = "components/dashboard/dashboard-shell.tsx" as const;

export const OFFLINE_MODE_UI_FEATURES = [
  "status_bar",
  "queue_badge",
  "sync_animation",
  "dark_mode",
] as const;

export const OFFLINE_MODE_UI_WIRING_PATHS = [
  "lib/pos/offline-mode-ui-indicator-policy.ts",
  "lib/pos/offline-mode-ui-indicator-audit.ts",
  "lib/pos/offline-mode-ui-indicator-data.ts",
  OFFLINE_MODE_UI_INDICATOR_PANEL_PATH,
  OFFLINE_MODE_UI_STATUS_BAR_PATH,
  OFFLINE_MODE_UI_GLOBAL_INDICATOR_PATH,
  OFFLINE_MODE_UI_SHELL_PATH,
  "tests/unit/offline-mode-ui-indicator.test.ts",
] as const;

export const OFFLINE_MODE_UI_UNIT_TEST = "tests/unit/offline-mode-ui-indicator.test.ts" as const;

export const OFFLINE_MODE_UI_CI_SCRIPTS = [
  "test:ci:offline-mode-ui-indicator",
  "test:ci:offline-mode-ui-indicator:cert",
] as const;

export type OfflineModeUiSeverity = "idle" | "warning" | "danger" | "syncing";

export type OfflineModeUiIndicatorVariant = "status_bar" | "queue_badge" | "floating";

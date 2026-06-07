import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  OFFLINE_MODE_UI_GLOBAL_INDICATOR_PATH,
  OFFLINE_MODE_UI_INDICATOR_PANEL_PATH,
  OFFLINE_MODE_UI_QUEUE_BADGE_TEST_ID,
  OFFLINE_MODE_UI_SHELL_PATH,
  OFFLINE_MODE_UI_STATUS_BAR_PATH,
  OFFLINE_MODE_UI_STATUS_BAR_TEST_ID,
  OFFLINE_MODE_UI_SYNC_ANIMATION_TEST_ID,
  OFFLINE_MODE_UI_WIRING_PATHS,
} from "@/lib/pos/offline-mode-ui-indicator-policy";

export type OfflineModeUiIndicatorAudit = {
  ok: boolean;
  failures: string[];
};

export function auditOfflineModeUiIndicatorWiring(
  root = process.cwd(),
): OfflineModeUiIndicatorAudit {
  const failures: string[] = [];

  for (const rel of OFFLINE_MODE_UI_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const panel = readFileSync(join(root, OFFLINE_MODE_UI_INDICATOR_PANEL_PATH), "utf8");
  if (!panel.includes("offline-mode-ui-indicator-policy")) {
    failures.push("offline-mode-ui-indicator.tsx missing policy import");
  }
  if (
    !panel.includes("OFFLINE_MODE_UI_QUEUE_BADGE_TEST_ID") &&
    !panel.includes(OFFLINE_MODE_UI_QUEUE_BADGE_TEST_ID)
  ) {
    failures.push("offline-mode-ui-indicator.tsx missing queue badge test id");
  }
  if (
    !panel.includes("OFFLINE_MODE_UI_SYNC_ANIMATION_TEST_ID") &&
    !panel.includes(OFFLINE_MODE_UI_SYNC_ANIMATION_TEST_ID)
  ) {
    failures.push("offline-mode-ui-indicator.tsx missing sync animation test id");
  }

  const statusBar = readFileSync(join(root, OFFLINE_MODE_UI_STATUS_BAR_PATH), "utf8");
  if (
    !statusBar.includes("OFFLINE_MODE_UI_STATUS_BAR_TEST_ID") &&
    !statusBar.includes(OFFLINE_MODE_UI_STATUS_BAR_TEST_ID)
  ) {
    failures.push("offline-sync-status-bar.tsx missing status bar test id");
  }
  if (!statusBar.includes("buildOfflineModeUiState")) {
    failures.push("offline-sync-status-bar.tsx missing UI state builder");
  }

  const globalIndicator = readFileSync(join(root, OFFLINE_MODE_UI_GLOBAL_INDICATOR_PATH), "utf8");
  if (!globalIndicator.includes("OfflineModeQueueBadge")) {
    failures.push("offline-indicator.tsx missing queue badge component");
  }

  const shell = readFileSync(join(root, OFFLINE_MODE_UI_SHELL_PATH), "utf8");
  if (!shell.includes("OfflineModeQueueBadge")) {
    failures.push("dashboard-shell.tsx missing header queue badge");
  }

  return { ok: failures.length === 0, failures };
}

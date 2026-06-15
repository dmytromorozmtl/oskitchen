import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditOfflineModeUiIndicatorWiring } from "@/lib/pos/offline-mode-ui-indicator-audit";
import {
  buildOfflineModeUiState,
  formatOfflineModeQueueBadgeCount,
  offlineModeQueueBadgeToneClass,
  offlineModeStatusBarToneClass,
  offlineModeSyncAnimationClass,
  resolveOfflineModeUiSeverity,
  shouldShowOfflineModeUi,
} from "@/lib/pos/offline-mode-ui-indicator-data";
import {
  OFFLINE_MODE_UI_CI_SCRIPTS,
  OFFLINE_MODE_UI_FEATURES,
  OFFLINE_MODE_UI_INDICATOR_POLICY_ID,
  OFFLINE_MODE_UI_INDICATOR_UPSTREAM_POLICY_ID,
  OFFLINE_MODE_UI_POS_ROUTE,
  OFFLINE_MODE_UI_QUEUE_BADGE_TEST_ID,
  OFFLINE_MODE_UI_STATUS_BAR_TEST_ID,
  OFFLINE_MODE_UI_SYNC_ANIMATION_TEST_ID,
  OFFLINE_MODE_UI_UNIT_TEST,
} from "@/lib/pos/offline-mode-ui-indicator-policy";

const ROOT = process.cwd();

describe("offline mode UI indicator (Absolute Final Task 62)", () => {
  it("locks UI indicator policy extending offline mode E2E", () => {
    expect(OFFLINE_MODE_UI_INDICATOR_POLICY_ID).toBe("offline-mode-ui-indicator-absolute-final-v1");
    expect(OFFLINE_MODE_UI_INDICATOR_UPSTREAM_POLICY_ID).toBe("pos-offline-mode-e2e-absolute-final-v1");
    expect(OFFLINE_MODE_UI_POS_ROUTE).toBe("/dashboard/pos/terminal");
    expect(OFFLINE_MODE_UI_STATUS_BAR_TEST_ID).toBe("offline-mode-ui-status-bar");
    expect(OFFLINE_MODE_UI_QUEUE_BADGE_TEST_ID).toBe("offline-mode-ui-queue-badge");
    expect(OFFLINE_MODE_UI_SYNC_ANIMATION_TEST_ID).toBe("offline-mode-ui-sync-animation");
    expect(OFFLINE_MODE_UI_FEATURES).toContain("queue_badge");
    expect(OFFLINE_MODE_UI_FEATURES).toContain("sync_animation");
  });

  it("resolves severity, visibility, and queue badge state", () => {
    expect(resolveOfflineModeUiSeverity({ online: true, queuedCount: 0, conflictCount: 0, syncState: "idle" })).toBe(
      "idle",
    );
    expect(resolveOfflineModeUiSeverity({ online: false, queuedCount: 2, conflictCount: 0, syncState: "idle" })).toBe(
      "warning",
    );
    expect(
      resolveOfflineModeUiSeverity({ online: true, queuedCount: 0, conflictCount: 1, syncState: "conflict" }),
    ).toBe("danger");
    expect(
      resolveOfflineModeUiSeverity({ online: true, queuedCount: 1, conflictCount: 0, syncState: "syncing" }),
    ).toBe("syncing");

    expect(shouldShowOfflineModeUi({ online: true, queuedCount: 0, conflictCount: 0, syncState: "idle" })).toBe(false);
    expect(
      shouldShowOfflineModeUi({ online: true, queuedCount: 0, conflictCount: 0, syncState: "idle" }, true),
    ).toBe(true);

    const syncing = buildOfflineModeUiState({
      online: true,
      queuedCount: 3,
      conflictCount: 0,
      syncState: "syncing",
    });
    expect(syncing.showSyncAnimation).toBe(true);
    expect(syncing.showQueueBadge).toBe(true);
    expect(formatOfflineModeQueueBadgeCount(120)).toBe("99+");
  });

  it("maps tone and sync animation classes for dark mode", () => {
    expect(offlineModeStatusBarToneClass("danger")).toContain("rose");
    expect(offlineModeStatusBarToneClass("syncing")).toContain("sky");
    expect(offlineModeQueueBadgeToneClass("warning")).toContain("amber");
    expect(offlineModeSyncAnimationClass("syncing")).toContain("animate-spin");
  });

  it("audits offline mode UI wiring in shell and POS surfaces", () => {
    const audit = auditOfflineModeUiIndicatorWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);

    const statusBar = readFileSync(join(ROOT, "components/dashboard/offline-sync-status-bar.tsx"), "utf8");
    expect(statusBar).toContain("OFFLINE_MODE_UI_STATUS_BAR_TEST_ID");
    expect(statusBar).toContain("OFFLINE_MODE_UI_QUEUE_BADGE_TEST_ID");
    expect(existsSync(join(ROOT, "components/dashboard/offline-mode-ui-indicator.tsx"))).toBe(true);
  });

  it("ships npm cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of OFFLINE_MODE_UI_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(OFFLINE_MODE_UI_UNIT_TEST).toBe("tests/unit/offline-mode-ui-indicator.test.ts");
  });
});

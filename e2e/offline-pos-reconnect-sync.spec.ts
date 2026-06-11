import { expect, test } from "@playwright/test";

import {
  OFFLINE_POS_INDEXED_DB_NAME,
  OFFLINE_POS_INDEXED_DB_STORE,
  OFFLINE_POS_RECONNECT_SYNC_E2E_POLICY_ID,
  OFFLINE_POS_RECONNECT_SYNC_FLOW_STEPS,
  POS_TERMINAL_PATH,
  isOfflineQueueDrained,
  offlineQueueSyncSucceeded,
  resolveOfflineQueueSyncPhase,
} from "@/lib/qa/offline-pos-reconnect-sync-e2e-policy";

import { runOfflinePosReconnectSyncFlow } from "./helpers/offline-pos-reconnect-sync-flow";
import {
  skipOfflinePosReconnectSyncIfGateDisabled,
  skipOfflinePosReconnectSyncIfNotAuthed,
} from "./helpers/offline-pos-reconnect-sync-ready";

/**
 * Offline POS → reconnect → sync golden path.
 *
 * Go offline → queue cash sale → reconnect → drain IndexedDB sync queue.
 *
 * @see e2e/offline-mode-queue-sync.spec.ts
 * @see e2e/pos-offline-mode.spec.ts
 * @see docs/POS_OFFLINE_MODE.md
 */

test.describe("offline pos reconnect sync policy", () => {
  test("exports offline mode routes and flow steps", () => {
    expect(OFFLINE_POS_RECONNECT_SYNC_E2E_POLICY_ID).toBe(
      "offline-pos-reconnect-sync-e2e-v1",
    );
    expect(POS_TERMINAL_PATH).toBe("/dashboard/pos/terminal");
    expect(OFFLINE_POS_INDEXED_DB_NAME).toBe("kitchenos-offline-pos");
    expect(OFFLINE_POS_INDEXED_DB_STORE).toBe("checkout_queue");
    expect(OFFLINE_POS_RECONNECT_SYNC_FLOW_STEPS).toEqual([
      "go_offline",
      "queue_sale",
      "reconnect_online",
      "sync_drain",
    ]);
  });

  test("evaluates queue drain lifecycle phases", () => {
    expect(resolveOfflineQueueSyncPhase({ online: false, queuedCount: 1, planBlocked: false })).toBe(
      "offline_queued",
    );
    expect(resolveOfflineQueueSyncPhase({ online: true, queuedCount: 0, planBlocked: false })).toBe(
      "drained",
    );
    expect(
      offlineQueueSyncSucceeded({
        queuedBeforeSync: 1,
        queuedAfterSync: 0,
        syncedCount: 1,
        tableConflictCount: 0,
      }),
    ).toBe(true);
    expect(isOfflineQueueDrained({ queuedAfterSync: 0 })).toBe(true);
  });
});

test.describe("offline pos reconnect sync (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Offline POS → reconnect → sync runs in chromium-authed project only",
    );
    skipOfflinePosReconnectSyncIfGateDisabled();
    skipOfflinePosReconnectSyncIfNotAuthed();
  });

  test("offline cash sale syncs when network reconnects", async ({ page, context }) => {
    const result = await runOfflinePosReconnectSyncFlow(page, context);
    expect(result.steps).toEqual(OFFLINE_POS_RECONNECT_SYNC_FLOW_STEPS);
    expect(result.queuedPeak).toBeGreaterThanOrEqual(1);
  });
});

import { expect, test } from "@playwright/test";

import {
  OFFLINE_MODE_QUEUE_SYNC_E2E_POLICY_ID,
  OFFLINE_MODE_QUEUE_SYNC_SLI_ID,
  OFFLINE_POS_INDEXED_DB_NAME,
  OFFLINE_POS_INDEXED_DB_STORE,
  POS_TERMINAL_PATH,
  hasOfflineTableConflicts,
  isOfflineQueueDrained,
  offlineQueueSyncSucceeded,
  resolveOfflineQueueSyncPhase,
} from "@/lib/pos/offline-mode-queue-sync-e2e-policy";
import {
  offlineQueueSyncWithinContract,
  summarizeOfflineQueueSync,
} from "@/lib/pos/offline-mode-queue-sync-metrics";
import {
  formatOfflineSyncSuccessMessage,
  queueOrder,
  resetOfflinePosQueuesForTests,
  syncQueue,
} from "@/services/pos-offline-queue";

import { runOfflineCashSaleQueueAndSyncFlow } from "./helpers/offline-mode-queue-sync-flow";
import { skipOfflineModeQueueSyncIfNotAuthed } from "./helpers/offline-mode-queue-sync-ready";

/**
 * Offline mode queue + sync E2E (QA-31).
 *
 * @see docs/POS_OFFLINE_MODE.md
 * @see e2e/pos-offline-queue.spec.ts
 */

test.describe("offline mode queue sync policy", () => {
  test("exports IndexedDB and POS terminal contract", () => {
    expect(OFFLINE_MODE_QUEUE_SYNC_E2E_POLICY_ID).toBe("offline-mode-queue-sync-e2e-v1");
    expect(OFFLINE_MODE_QUEUE_SYNC_SLI_ID).toBe("pos.offline_queue_sync_drain");
    expect(OFFLINE_POS_INDEXED_DB_NAME).toBe("kitchenos-offline-pos");
    expect(OFFLINE_POS_INDEXED_DB_STORE).toBe("checkout_queue");
    expect(POS_TERMINAL_PATH).toBe("/dashboard/pos/terminal");
  });

  test("evaluates queue drain lifecycle phases", () => {
    expect(resolveOfflineQueueSyncPhase({ online: false, queuedCount: 2, planBlocked: false })).toBe(
      "offline_queued",
    );
    expect(resolveOfflineQueueSyncPhase({ online: true, queuedCount: 2, planBlocked: false })).toBe(
      "online_syncing",
    );
    expect(resolveOfflineQueueSyncPhase({ online: true, queuedCount: 0, planBlocked: false })).toBe(
      "drained",
    );
    expect(isOfflineQueueDrained({ queuedAfterSync: 0 })).toBe(true);
    expect(
      offlineQueueSyncSucceeded({
        queuedBeforeSync: 1,
        queuedAfterSync: 0,
        syncedCount: 1,
        tableConflictCount: 0,
      }),
    ).toBe(true);
  });
});

test.describe("offline mode server queue sync", () => {
  const userId = "offline-mode-queue-sync-e2e";

  test.beforeEach(() => {
    resetOfflinePosQueuesForTests();
  });

  test("queues offline order then drains on syncQueue", async () => {
    const payload = {
      registerId: "reg-offline-e2e",
      shiftId: null,
      staffMemberId: null,
      locationId: null,
      brandId: null,
      customerId: null,
      fulfillmentDetail: "pickup" as const,
      paymentMode: "cash" as const,
      lines: [{ title: "Burger", quantity: 1, unitPrice: 12 }],
    };

    await queueOrder({ userId, payload, metadata: { deviceId: "ipad-1" } });

    const result = await syncQueue({
      userId,
      checkoutHandler: async () => ({
        ok: true,
        orderId: "order-offline-1",
        transactionId: "tx-offline-1",
        receiptNumber: "POS-OFF-1",
      }),
    });

    expect(result.synced).toBe(1);
    expect(formatOfflineSyncSuccessMessage(result.synced)).toBe("1 order synced when back online");

    const contract = {
      queuedBeforeSync: 1,
      queuedAfterSync: 0,
      syncedCount: result.synced,
      tableConflictCount: 0,
    };
    expect(offlineQueueSyncWithinContract(contract)).toBe(true);
    expect(summarizeOfflineQueueSync(contract).drained).toBe(true);
  });

  test("detects same-table conflicts across devices before sync", async () => {
    const payload = {
      registerId: "reg-offline-e2e",
      shiftId: null,
      staffMemberId: null,
      locationId: null,
      brandId: null,
      customerId: null,
      fulfillmentDetail: "pickup" as const,
      paymentMode: "cash" as const,
      lines: [{ title: "Salad", quantity: 1, unitPrice: 9 }],
    };

    await queueOrder({
      userId,
      payload,
      metadata: { tableId: "T7", deviceId: "ipad-bar" },
    });
    await queueOrder({
      userId,
      payload,
      metadata: { tableId: "T7", deviceId: "ipad-patio" },
    });

    const { getOfflineQueueStats } = await import("@/services/pos-offline-queue");
    const stats = await getOfflineQueueStats({ userId });
    expect(stats.tableConflicts).toHaveLength(1);
    expect(stats.tableConflicts[0]?.tableId).toBe("T7");
    expect(stats.tableConflicts[0]?.deviceIds.sort()).toEqual(["ipad-bar", "ipad-patio"]);
    expect(hasOfflineTableConflicts(stats.tableConflicts.length)).toBe(true);
  });
});

test.describe("offline mode queue sync UI (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Offline queue sync UI runs in chromium-authed project only",
    );
    skipOfflineModeQueueSyncIfNotAuthed();
  });

  test("offline cash sale queues in IndexedDB then drains when online", async ({ page, context }) => {
    const { queuedPeak } = await runOfflineCashSaleQueueAndSyncFlow(page, context);
    expect(queuedPeak).toBeGreaterThanOrEqual(1);
  });
});

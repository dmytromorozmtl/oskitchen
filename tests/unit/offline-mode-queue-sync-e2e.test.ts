import { beforeEach, describe, expect, it } from "vitest";

import {
  OFFLINE_MODE_QUEUE_SYNC_E2E_POLICY_ID,
  OFFLINE_POS_INDEXED_DB_NAME,
  OFFLINE_POS_INDEXED_DB_STORE,
  isOfflineQueueDrained,
  offlineQueueSyncSucceeded,
  resolveOfflineQueueSyncPhase,
} from "@/lib/pos/offline-mode-queue-sync-e2e-policy";
import {
  offlineQueueSyncWithinContract,
  summarizeOfflineQueueSync,
} from "@/lib/pos/offline-mode-queue-sync-metrics";
import { formatOfflineSyncSuccessMessage } from "@/lib/pos/offline-sync";
import {
  queueOrder,
  resetOfflinePosQueuesForTests,
  syncQueue,
} from "@/services/pos-offline-queue";

describe("offline mode queue sync E2E policy (QA-31)", () => {
  it("exports IndexedDB contract aligned with offline-pos-queue", () => {
    expect(OFFLINE_MODE_QUEUE_SYNC_E2E_POLICY_ID).toBe("offline-mode-queue-sync-e2e-v1");
    expect(OFFLINE_POS_INDEXED_DB_NAME).toBe("kitchenos-offline-pos");
    expect(OFFLINE_POS_INDEXED_DB_STORE).toBe("checkout_queue");
    expect(resolveOfflineQueueSyncPhase({ online: true, queuedCount: 0, planBlocked: false })).toBe(
      "drained",
    );
  });

  it("summarizes successful queue drain contract", () => {
    const summary = summarizeOfflineQueueSync({
      queuedBeforeSync: 3,
      queuedAfterSync: 0,
      syncedCount: 3,
      tableConflictCount: 0,
    });
    expect(summary.drained).toBe(true);
    expect(summary.succeeded).toBe(true);
    expect(offlineQueueSyncWithinContract(summary)).toBe(true);
    expect(isOfflineQueueDrained({ queuedAfterSync: 0 })).toBe(true);
    expect(offlineQueueSyncSucceeded(summary)).toBe(true);
  });
});

describe("offline mode server queue lifecycle (QA-31)", () => {
  const userId = "qa-31-offline-sync";

  beforeEach(() => {
    resetOfflinePosQueuesForTests();
  });

  it("syncQueue drains pending orders and formats success message", async () => {
    await queueOrder({
      userId,
      payload: {
        registerId: "reg-qa31",
        shiftId: null,
        staffMemberId: null,
        locationId: null,
        brandId: null,
        customerId: null,
        fulfillmentDetail: "pickup",
        paymentMode: "cash",
        lines: [{ title: "Soup", quantity: 2, unitPrice: 6 }],
      },
    });

    const result = await syncQueue({
      userId,
      checkoutHandler: async () => ({
        ok: true,
        orderId: "order-qa31",
        transactionId: "tx-qa31",
        receiptNumber: "POS-QA31",
      }),
    });

    expect(result.synced).toBe(1);
    expect(formatOfflineSyncSuccessMessage(result.synced)).toBe("1 order synced when back online");
  });

  it("getOfflineQueueStats surfaces same-table multi-device conflicts", async () => {
    const payload = {
      registerId: "reg-qa31",
      shiftId: null,
      staffMemberId: null,
      locationId: null,
      brandId: null,
      customerId: null,
      fulfillmentDetail: "pickup" as const,
      paymentMode: "cash" as const,
      lines: [{ title: "Pizza", quantity: 1, unitPrice: 14 }],
    };

    await queueOrder({ userId, payload, metadata: { tableId: "T3", deviceId: "device-a" } });
    await queueOrder({ userId, payload, metadata: { tableId: "T3", deviceId: "device-b" } });

    const { getOfflineQueueStats } = await import("@/services/pos-offline-queue");
    const stats = await getOfflineQueueStats({ userId });

    expect(stats.tableConflicts).toHaveLength(1);
    expect(stats.tableConflicts[0]?.tableId).toBe("T3");
    expect(stats.tableConflicts[0]?.deviceIds.sort()).toEqual(["device-a", "device-b"]);
  });
});

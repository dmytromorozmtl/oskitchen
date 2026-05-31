import { describe, expect, it, beforeEach } from "vitest";

import {
  detectOfflineTableConflicts,
  formatOfflineSyncSuccessMessage,
  getOfflineQueueStats,
  queueOrder,
  queueReceiptPrint,
  resetOfflinePosQueuesForTests,
  storeOfflinePreAuthorization,
  stressTestOfflineQueue,
  syncQueue,
} from "@/services/pos-offline-queue";

describe("pos-offline-queue production features", () => {
  const userId = "user-stress-test";

  beforeEach(() => {
    resetOfflinePosQueuesForTests();
  });

  it("formats synced counter message", () => {
    expect(formatOfflineSyncSuccessMessage(47)).toBe("47 orders synced when back online");
    expect(formatOfflineSyncSuccessMessage(1)).toBe("1 order synced when back online");
    expect(formatOfflineSyncSuccessMessage(0)).toBe("No offline orders to sync.");
  });

  it("detects same-table conflicts across devices", async () => {
    const payload = {
      registerId: "reg-1",
      shiftId: null,
      staffMemberId: null,
      locationId: null,
      brandId: null,
      customerId: null,
      fulfillmentDetail: "pickup" as const,
      paymentMode: "cash" as const,
      lines: [{ title: "Burger", quantity: 1, unitPrice: 10 }],
    };

    await queueOrder({
      userId,
      payload,
      metadata: { tableId: "T12", deviceId: "ipad-bar" },
    });
    await queueOrder({
      userId,
      payload,
      metadata: { tableId: "T12", deviceId: "ipad-patio" },
    });

    const stats = getOfflineQueueStats({ userId });
    expect(stats.tableConflicts).toHaveLength(1);
    expect(stats.tableConflicts[0]?.tableId).toBe("T12");
    expect(stats.tableConflicts[0]?.deviceIds.sort()).toEqual(["ipad-bar", "ipad-patio"]);
  });

  it("queues receipts and marks printed on sync", async () => {
    await queueReceiptPrint({
      userId,
      offlineSaleId: "offline-1",
      receiptText: "Receipt body",
    });

    const result = await syncQueue({
      userId,
      checkoutHandler: async () => ({
        ok: true,
        orderId: "order-1",
        transactionId: "tx-1",
        receiptNumber: "POS-1",
      }),
    });

    expect(result.receiptsPrinted).toBe(1);
    expect(getOfflineQueueStats({ userId }).pendingReceipts).toBe(0);
  });

  it("stores offline pre-auth for capture retry when online", async () => {
    await storeOfflinePreAuthorization({
      userId,
      offlineSaleId: "offline-card-1",
      registerId: "reg-1",
      amountCents: 2500,
      tableId: "T4",
      deviceId: "ipad-1",
    });

    const result = await syncQueue({ userId, online: true });
    expect(result.preAuthsCaptured).toBe(0);
    expect(getOfflineQueueStats({ userId }).pendingPreAuths).toBe(0);
  });

  it("stress tests 100 queued orders through mock checkout", async () => {
    const result = await stressTestOfflineQueue({
      userId,
      orderCount: 100,
    });

    expect(result.queued).toBe(100);
    expect(result.synced).toBeGreaterThan(0);
    expect(result.syncedMessage).toContain("synced when back online");
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(getOfflineQueueStats({ userId }).syncedTotal).toBe(result.synced);
  });
});

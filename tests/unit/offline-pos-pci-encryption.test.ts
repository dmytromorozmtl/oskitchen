import { beforeEach, describe, expect, it } from "vitest";

import {
  isOfflinePciStorageAvailable,
  sealOfflinePciField,
  unsealOfflinePciField,
} from "@/lib/pos/offline-pci-local-encryption";
import { runOfflinePosAutoSync } from "@/lib/pos/offline-pos-auto-sync";
import {
  OFFLINE_POS_AUTO_SYNC_RETRY_LIMIT,
  POS_OFFLINE_QUEUE_POLICY_ID,
  syncQueueWithAutoRetry,
} from "@/services/pos-offline-queue";
import { resetOfflinePosQueuesForTests, queueOrder } from "@/services/pos-offline-queue";

describe("offline PCI local encryption", () => {
  it("seals and unseals card metadata fields", async () => {
    const sealed = await sealOfflinePciField("4242");
    expect(sealed.algorithm).toBe(isOfflinePciStorageAvailable() ? "aes-gcm-v1" : "noop-v1");
    const plain = await unsealOfflinePciField(sealed);
    expect(plain).toBe("4242");
  });
});

describe("offline POS auto-sync service", () => {
  const userId = "offline-auto-sync-user";

  beforeEach(() => {
    resetOfflinePosQueuesForTests();
  });

  it("locks offline queue policy v2 constants", () => {
    expect(POS_OFFLINE_QUEUE_POLICY_ID).toBe("pos-offline-queue-v2");
    expect(OFFLINE_POS_AUTO_SYNC_RETRY_LIMIT).toBe(3);
  });

  it("syncQueueWithAutoRetry replays transient failures", async () => {
    let attempts = 0;
    await queueOrder({
      userId,
      payload: {
        registerId: "reg-retry",
        shiftId: null,
        staffMemberId: null,
        locationId: null,
        brandId: null,
        customerId: null,
        fulfillmentDetail: "pickup",
        paymentMode: "cash",
        lines: [{ title: "Tea", quantity: 1, unitPrice: 3 }],
      },
    });

    const result = await syncQueueWithAutoRetry({
      userId,
      checkoutHandler: async () => {
        attempts += 1;
        if (attempts < 2) {
          return { ok: false as const, error: "network timeout while syncing" };
        }
        return {
          ok: true as const,
          orderId: "order-retry",
          transactionId: "tx-retry",
          receiptNumber: "POS-RETRY",
        };
      },
    });

    expect(result.retries).toBeGreaterThanOrEqual(1);
    expect(result.synced).toBe(1);
  });

  it("runOfflinePosAutoSync drains checkout and card handlers", async () => {
    const result = await runOfflinePosAutoSync(
      {
        flushCheckoutQueue: async () => ({ checkoutSynced: 2, checkoutFailed: 0 }),
        flushCardQueue: async () => ({ cardCaptured: 1, cardFailed: 0 }),
      },
      { force: true },
    );
    expect(result?.checkoutSynced).toBe(2);
    expect(result?.cardCaptured).toBe(1);
  });
});

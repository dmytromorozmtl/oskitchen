import { beforeEach, describe, expect, it, vi } from "vitest";

import { assertPciSafeOfflineCardCapture, scanForForbiddenCardholderData } from "@/lib/pos/offline-card-pci";
import {
  enqueueOfflineCardCapture,
  linkOfflineCardCaptureToOrder,
  resetOfflineCardCapturesForTests,
  syncOfflineCardCaptures,
} from "@/services/pos/offline-card-service";

vi.mock("@/services/payments/stripe-terminal-service", () => ({
  processTerminalPayment: vi.fn().mockResolvedValue({ id: "tx-1" }),
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn(() => null),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<void>) => {
      const tx = {
        order: { update: vi.fn() },
        pOSTransaction: { findFirst: vi.fn().mockResolvedValue(null), update: vi.fn() },
        pOSPayment: { findFirst: vi.fn(), update: vi.fn() },
      };
      await fn(tx);
    }),
    pOSAuditEvent: { create: vi.fn() },
  },
}));

describe("offline card PCI", () => {
  it("rejects PAN-like strings", () => {
    expect(scanForForbiddenCardholderData("4111111111111111")).toMatch(/card number/i);
  });

  it("accepts safe last4 metadata", () => {
    const safe = assertPciSafeOfflineCardCapture({
      offlineSaleId: "00000000-0000-4000-8000-000000000099",
      registerId: "00000000-0000-4000-8000-000000000001",
      amountCents: 1500,
      cardBrand: "visa",
      last4: "4242",
    });
    expect(safe.last4).toBe("4242");
  });
});

describe("offline card service", () => {
  const userId = "00000000-0000-4000-8000-000000000010";
  const offlineSaleId = "00000000-0000-4000-8000-000000000099";
  const registerId = "00000000-0000-4000-8000-000000000001";

  beforeEach(() => {
    resetOfflineCardCapturesForTests();
  });

  it("queues capture and fails sync without order link", async () => {
    await enqueueOfflineCardCapture({
      userId,
      capture: {
        offlineSaleId,
        registerId,
        amountCents: 1200,
        cardBrand: "visa",
        last4: "1234",
      },
    });

    const sync = await syncOfflineCardCaptures({ userId, online: true });
    expect(sync.attempted).toBe(0);
    expect(sync.failed).toBe(1);
  });

  it("syncs when order and payment intent are linked", async () => {
    await enqueueOfflineCardCapture({
      userId,
      capture: {
        offlineSaleId,
        registerId,
        amountCents: 1200,
        cardBrand: "visa",
        last4: "1234",
        paymentIntentId: "pi_test123",
      },
    });
    await linkOfflineCardCaptureToOrder({
      userId,
      offlineSaleId,
      orderId: "00000000-0000-4000-8000-000000000020",
    });

    const sync = await syncOfflineCardCaptures({ userId, online: true });
    expect(sync.captured).toBe(1);
  });
});

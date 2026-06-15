import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn(),
}));

const txMock = vi.hoisted(() => ({
  order: { update: vi.fn() },
  pOSTransaction: { update: vi.fn() },
  pOSPayment: { update: vi.fn(), create: vi.fn() },
  pOSAuditEvent: { create: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pOSTransaction: {
      findFirst: vi.fn(),
      findFirstOrThrow: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import {
  cancelTerminalPayment,
  createTerminalConnectionToken,
  createTerminalPaymentIntent,
  processTerminalPayment,
} from "@/services/payments/stripe-terminal-service";

describe("stripe terminal service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.$transaction).mockImplementation(async (callback: (tx: typeof txMock) => unknown) => callback(txMock));
    vi.mocked(prisma.pOSTransaction.findFirstOrThrow).mockResolvedValue({
      id: "tx-1",
      payments: [],
    } as never);
  });

  it("creates connection tokens from Stripe", async () => {
    const create = vi.fn().mockResolvedValue({ secret: "terminal-token-123" });
    vi.mocked(getStripe).mockReturnValue({
      terminal: { connectionTokens: { create } },
    } as never);

    await expect(createTerminalConnectionToken()).resolves.toBe("terminal-token-123");
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("creates card-present payment intents in cents with metadata", async () => {
    const create = vi.fn().mockResolvedValue({
      client_secret: "pi_secret_123",
      id: "pi_123",
    });
    vi.mocked(getStripe).mockReturnValue({
      paymentIntents: { create },
    } as never);

    await expect(
      createTerminalPaymentIntent(12.5, "usd", { orderId: "order-1", userId: "owner-user-1" }),
    ).resolves.toEqual({
      clientSecret: "pi_secret_123",
      paymentIntentId: "pi_123",
    });
    expect(create).toHaveBeenCalledWith({
      amount: 1250,
      currency: "usd",
      payment_method_types: ["card_present"],
      capture_method: "automatic",
      metadata: { orderId: "order-1", userId: "owner-user-1" },
    });
  });

  it("rejects terminal capture when Stripe has not marked the payment intent succeeded", async () => {
    const retrieve = vi.fn().mockResolvedValue({
      status: "requires_capture",
      latest_charge: null,
    });
    vi.mocked(getStripe).mockReturnValue({
      paymentIntents: { retrieve },
    } as never);

    await expect(processTerminalPayment("pi_123", "order-1", "owner-user-1")).rejects.toThrow(
      "Payment not succeeded: requires_capture",
    );
    expect(prisma.pOSTransaction.findFirst).not.toHaveBeenCalled();
  });

  it("updates existing POS payment rows and records terminal capture audit metadata", async () => {
    const retrieve = vi.fn().mockResolvedValue({
      status: "succeeded",
      latest_charge: {
        payment_method_details: {
          card_present: { brand: "visa", last4: "4242" },
        },
      },
    });
    vi.mocked(getStripe).mockReturnValue({
      paymentIntents: { retrieve },
    } as never);
    vi.mocked(prisma.pOSTransaction.findFirst).mockResolvedValue({
      id: "tx-1",
      orderId: "order-1",
      registerId: "reg-1",
      shiftId: "shift-1",
      staffId: "staff-1",
      total: 12.5,
      payments: [{ id: "pay-1" }],
    } as never);

    await processTerminalPayment("pi_123", "order-1", "owner-user-1");

    expect(txMock.order.update).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: {
        paymentStatus: "PAID",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
      },
    });
    expect(txMock.pOSTransaction.update).toHaveBeenCalledWith({
      where: { id: "tx-1" },
      data: {
        paymentStatus: "PAID",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
        externalPaymentReference: "pi_123",
      },
    });
    expect(txMock.pOSPayment.update).toHaveBeenCalledWith({
      where: { id: "pay-1" },
      data: {
        status: "PAID",
        provider: "STRIPE",
        providerReference: "pi_123",
      },
    });
    expect(txMock.pOSPayment.create).not.toHaveBeenCalled();
    expect(txMock.pOSAuditEvent.create).toHaveBeenCalledWith({
      data: {
        userId: "owner-user-1",
        registerId: "reg-1",
        shiftId: "shift-1",
        transactionId: "tx-1",
        staffId: "staff-1",
        action: "pos.terminal.payment_captured",
        metadataJson: {
          paymentIntentId: "pi_123",
          cardBrand: "visa",
          last4: "4242",
        },
      },
    });
    expect(prisma.pOSTransaction.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: "tx-1" },
      include: { payments: true },
    });
  });

  it("creates a POS payment row when a terminal capture lands on a transaction without payments", async () => {
    const retrieve = vi.fn().mockResolvedValue({
      status: "succeeded",
      latest_charge: null,
    });
    vi.mocked(getStripe).mockReturnValue({
      paymentIntents: { retrieve },
    } as never);
    vi.mocked(prisma.pOSTransaction.findFirst).mockResolvedValue({
      id: "tx-1",
      orderId: "order-1",
      registerId: "reg-1",
      shiftId: "shift-1",
      staffId: "staff-1",
      total: 18,
      payments: [],
    } as never);

    await processTerminalPayment("pi_123", "order-1", "owner-user-1");

    expect(txMock.pOSPayment.create).toHaveBeenCalledWith({
      data: {
        transactionId: "tx-1",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
        amount: 18,
        status: "PAID",
        provider: "STRIPE",
        providerReference: "pi_123",
      },
    });
    expect(txMock.pOSPayment.update).not.toHaveBeenCalled();
  });

  it("cancels terminal payment intents through Stripe", async () => {
    const cancel = vi.fn().mockResolvedValue({});
    vi.mocked(getStripe).mockReturnValue({
      paymentIntents: { cancel },
    } as never);

    await cancelTerminalPayment("pi_123");

    expect(cancel).toHaveBeenCalledWith("pi_123");
  });
});

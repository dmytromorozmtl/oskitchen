import { beforeEach, describe, expect, it, vi } from "vitest";

const txMock = vi.hoisted(() => ({
  storefrontConversionEvent: { create: vi.fn() },
  storefrontOrder: { update: vi.fn() },
}));

const prismaMock = vi.hoisted(() => ({
  storefrontOrder: {
    findFirst: vi.fn(),
  },
  $transaction: vi.fn(async (callback: (tx: typeof txMock) => Promise<unknown>) => callback(txMock)),
}));

const stripeMinorAmountForOrder = vi.hoisted(() => vi.fn());
const isStorefrontOnlineCheckoutAvailable = vi.hoisted(() => vi.fn());
const createStorefrontStripeCheckoutSession = vi.hoisted(() => vi.fn());
const logStorefrontPaymentFailedWorkspaceAudit = vi.hoisted(() => vi.fn());
const logStorefrontPaymentRetryWorkspaceAudit = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/services/storefront/storefront-payment-audit", () => ({
  logStorefrontPaymentFailedWorkspaceAudit,
  logStorefrontPaymentRetryWorkspaceAudit,
}));

vi.mock("@/services/storefront/storefront-currency-service", () => ({
  stripeMinorAmountForOrder,
}));

vi.mock("@/services/storefront/storefront-payment-service", () => ({
  isStorefrontOnlineCheckoutAvailable,
}));

vi.mock("@/services/storefront/storefront-stripe-checkout-service", () => ({
  createStorefrontStripeCheckoutSession,
}));

import {
  applyStorefrontCheckoutCanceledIfNeeded,
  retryStorefrontOnlinePaymentByToken,
} from "@/services/storefront/storefront-payment-recovery-service";

const retryableOrder = {
  id: "sfo-1",
  orderNumber: "SF-001",
  paymentMode: "ONLINE_PAYMENT",
  paymentStatus: "FAILED",
  publicToken: "tok_12345678",
  storefrontId: "sf-1",
  total: 18.5,
  userId: "owner-1",
  storefront: {
    storeSlug: "hello",
    onlinePaymentEnabled: true,
    payLaterOnly: false,
    currency: "USD",
    stripeConnectAccountId: null,
    stripeConnectChargesEnabled: false,
    stripeConnectPayoutsEnabled: false,
    stripeConnectDetailsSubmitted: false,
    stripeApplicationFeeBps: null,
  },
  internalOrder: {
    sourceMetadataJson: { pendingStorefrontPromoId: "promo-1" },
  },
};

describe("storefront payment recovery service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof txMock) => Promise<unknown>) => callback(txMock),
    );
    prismaMock.storefrontOrder.findFirst.mockResolvedValue(retryableOrder);
    isStorefrontOnlineCheckoutAvailable.mockReturnValue(true);
    stripeMinorAmountForOrder.mockReturnValue({
      ok: true,
      amountMinor: 1850,
      currency: "usd",
    });
  });

  it("restarts checkout for the same token and restores pending state", async () => {
    createStorefrontStripeCheckoutSession.mockResolvedValue({
      ok: true,
      url: "https://stripe.test/retry",
    });

    const result = await retryStorefrontOnlinePaymentByToken({
      publicToken: "tok_12345678",
      storeSlug: "hello",
    });

    expect(result).toEqual({
      ok: true,
      stripeCheckoutUrl: "https://stripe.test/retry",
    });
    expect(createStorefrontStripeCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        publicToken: "tok_12345678",
        pendingPromoId: "promo-1",
        storefrontOrderId: "sfo-1",
      }),
    );
    expect(txMock.storefrontOrder.update).toHaveBeenCalledWith({
      where: { id: "sfo-1" },
      data: { paymentStatus: "PENDING" },
    });
    expect(txMock.storefrontConversionEvent.create).toHaveBeenCalledWith({
      data: {
        storefrontId: "sf-1",
        eventName: "order_payment_retry_started",
        metadataJson: {
          paymentStatusBefore: "FAILED",
          publicToken: "tok_12345678",
        },
      },
    });
  });

  it("keeps the order in failed state when retry session creation fails", async () => {
    createStorefrontStripeCheckoutSession.mockResolvedValue({
      ok: false,
      error: "Stripe checkout unavailable",
    });

    const result = await retryStorefrontOnlinePaymentByToken({
      publicToken: "tok_12345678",
      storeSlug: "hello",
    });

    expect(result).toEqual({
      ok: false,
      error: "Stripe checkout unavailable",
    });
    expect(txMock.storefrontOrder.update).toHaveBeenCalledWith({
      where: { id: "sfo-1" },
      data: { paymentStatus: "FAILED" },
    });
    expect(txMock.storefrontConversionEvent.create).toHaveBeenCalledWith({
      data: {
        storefrontId: "sf-1",
        eventName: "order_payment_failed",
        metadataJson: {
          phase: "retry_checkout",
          publicToken: "tok_12345678",
          reason: "Stripe checkout unavailable",
        },
      },
    });
  });

  it("rejects retry when payment is still pending to avoid duplicate live checkout sessions", async () => {
    prismaMock.storefrontOrder.findFirst.mockResolvedValue({
      ...retryableOrder,
      paymentStatus: "PENDING",
    });

    const result = await retryStorefrontOnlinePaymentByToken({
      publicToken: "tok_12345678",
      storeSlug: "hello",
    });

    expect(result).toEqual({
      ok: false,
      error:
        "Payment is still in progress for this order. Use the original checkout window or wait for confirmation.",
    });
    expect(createStorefrontStripeCheckoutSession).not.toHaveBeenCalled();
    expect(txMock.storefrontOrder.update).not.toHaveBeenCalled();
    expect(txMock.storefrontConversionEvent.create).not.toHaveBeenCalled();
  });

  it("marks pending online orders failed when Stripe checkout is canceled", async () => {
    prismaMock.storefrontOrder.findFirst.mockResolvedValue({
      id: "sfo-1",
      userId: "owner-1",
      storefrontId: "sf-1",
      publicToken: "tok_12345678",
      paymentMode: "ONLINE_PAYMENT",
      paymentStatus: "PENDING",
    });

    const result = await applyStorefrontCheckoutCanceledIfNeeded({
      publicToken: "tok_12345678",
      storeSlug: "hello",
    });

    expect(result).toEqual({ applied: true });
    expect(txMock.storefrontOrder.update).toHaveBeenCalledWith({
      where: { id: "sfo-1" },
      data: { paymentStatus: "FAILED" },
    });
    expect(txMock.storefrontConversionEvent.create).toHaveBeenCalledWith({
      data: {
        storefrontId: "sf-1",
        eventName: "order_payment_failed",
        metadataJson: {
          phase: "checkout_canceled",
          publicToken: "tok_12345678",
          reason: "Customer canceled Stripe Checkout.",
        },
      },
    });
    expect(logStorefrontPaymentFailedWorkspaceAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        merchantUserId: "owner-1",
        phase: "checkout_canceled",
      }),
    );
  });

  it("is idempotent when checkout cancel is replayed on a failed order", async () => {
    prismaMock.storefrontOrder.findFirst.mockResolvedValue({
      id: "sfo-1",
      userId: "owner-1",
      storefrontId: "sf-1",
      publicToken: "tok_12345678",
      paymentMode: "ONLINE_PAYMENT",
      paymentStatus: "FAILED",
    });

    const result = await applyStorefrontCheckoutCanceledIfNeeded({
      publicToken: "tok_12345678",
      storeSlug: "hello",
    });

    expect(result).toEqual({ applied: false });
    expect(txMock.storefrontOrder.update).not.toHaveBeenCalled();
  });
});

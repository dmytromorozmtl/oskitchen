import { beforeEach, describe, expect, it, vi } from "vitest";

const loggerError = vi.hoisted(() => vi.fn());
const loggerWarn = vi.hoisted(() => vi.fn());

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  kitchenSettings: { findUnique: vi.fn() },
  orderItem: { findMany: vi.fn() },
  storefrontConversionEvent: { create: vi.fn() },
  storefrontOrder: { findUnique: vi.fn() },
  storefrontSettings: { findUnique: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/billing/stripe-client", () => ({
  getStripeClient: vi.fn(),
  safeStripeError: vi.fn((error: unknown) => String(error)),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: loggerError,
    warn: loggerWarn,
  },
}));

import { applyStorefrontOrderCheckoutCompleted } from "@/services/storefront/storefront-stripe-checkout-service";

describe("storefront stripe checkout idempotency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.storefrontOrder.findUnique.mockResolvedValue({
      id: "sfo-1",
      internalOrderId: "ord-1",
      paymentStatus: "PAID",
      internalOrder: {
        id: "ord-1",
      },
    });
  });

  it("short-circuits repeated completion when the storefront order is already paid", async () => {
    await applyStorefrontOrderCheckoutCompleted(
      {
        id: "cs_storefront_1",
        metadata: {
          purpose: "storefront_order",
          storefrontOrderId: "sfo-1",
        },
        payment_status: "paid",
        amount_total: 1850,
        currency: "usd",
      } as never,
      { stripeEventId: "evt_storefront_1" },
    );

    expect(prismaMock.storefrontOrder.findUnique).toHaveBeenCalledWith({
      where: { id: "sfo-1" },
      include: { internalOrder: true },
    });
    expect(prismaMock.storefrontSettings.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(prismaMock.kitchenSettings.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.orderItem.findMany).not.toHaveBeenCalled();
    expect(prismaMock.storefrontConversionEvent.create).not.toHaveBeenCalled();
  });
});

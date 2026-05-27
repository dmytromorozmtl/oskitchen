import { beforeEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.hoisted(() => vi.fn());
const constructEvent = vi.hoisted(() => vi.fn());
const getStripeClient = vi.hoisted(() => vi.fn());
const markTrialConverted = vi.hoisted(() => vi.fn());
const recordBillingEvent = vi.hoisted(() => vi.fn());
const applyStripeCheckoutCompleted = vi.hoisted(() => vi.fn());
const applyStripeInvoice = vi.hoisted(() => vi.fn());
const applyStripeSubscription = vi.hoisted(() => vi.fn());
const applyStorefrontOrderCheckoutCompleted = vi.hoisted(() => vi.fn());
const auditLog = vi.hoisted(() => vi.fn());
const loggerError = vi.hoisted(() => vi.fn());
const loggerWarn = vi.hoisted(() => vi.fn());

const prismaMock = vi.hoisted(() => ({
  billingEvent: { findUnique: vi.fn() },
  subscription: { findFirst: vi.fn() },
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("@/lib/billing/stripe-client", () => ({
  getStripeClient,
}));

vi.mock("@/lib/billing/access", () => ({
  markTrialConverted,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: loggerError,
    warn: loggerWarn,
  },
}));

vi.mock("@/services/billing/billing-service", () => ({
  recordBillingEvent,
}));

vi.mock("@/services/billing/subscription-service", () => ({
  applyStripeCheckoutCompleted,
  applyStripeInvoice,
  applyStripeSubscription,
}));

vi.mock("@/services/storefront/storefront-stripe-checkout-service", () => ({
  applyStorefrontOrderCheckoutCompleted,
}));

vi.mock("@/services/audit/audit-service", () => ({
  auditLog,
}));

import { POST } from "@/app/api/webhooks/stripe/route";

describe("stripe webhook storefront idempotency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";

    headersMock.mockResolvedValue(new Headers({ "stripe-signature": "sig_test" }));
    prismaMock.billingEvent.findUnique.mockResolvedValue(null);
    prismaMock.subscription.findFirst.mockResolvedValue(null);
    applyStorefrontOrderCheckoutCompleted.mockResolvedValue(undefined);

    getStripeClient.mockReturnValue({
      subscriptions: { retrieve: vi.fn() },
      webhooks: { constructEvent },
    });

    constructEvent.mockReturnValue({
      id: "evt_storefront_1",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_storefront_1",
          metadata: {
            purpose: "storefront_order",
            storefrontOrderId: "sfo-1",
          },
          payment_status: "paid",
        },
      },
    });
  });

  it("acknowledges duplicate storefront webhook events without reprocessing", async () => {
    prismaMock.billingEvent.findUnique.mockResolvedValue({ id: "be-1" });

    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true, duplicate: true });
    expect(applyStorefrontOrderCheckoutCompleted).not.toHaveBeenCalled();
    expect(applyStripeCheckoutCompleted).not.toHaveBeenCalled();
  });

  it("routes storefront checkout completion through the storefront service exactly once", async () => {
    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
    expect(applyStorefrontOrderCheckoutCompleted).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "cs_storefront_1",
        metadata: expect.objectContaining({
          purpose: "storefront_order",
          storefrontOrderId: "sfo-1",
        }),
      }),
      { stripeEventId: "evt_storefront_1" },
    );
    expect(applyStripeCheckoutCompleted).not.toHaveBeenCalled();
    expect(markTrialConverted).not.toHaveBeenCalled();
  });
});

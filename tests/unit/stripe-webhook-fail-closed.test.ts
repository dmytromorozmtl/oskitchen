import { beforeEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.hoisted(() => vi.fn());
const getStripeClient = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("@/lib/billing/stripe-client", () => ({
  getStripeClient,
}));

vi.mock("@/lib/billing/access", () => ({
  markTrialConverted: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    billingEvent: { findUnique: vi.fn() },
    subscription: { findFirst: vi.fn() },
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

vi.mock("@/services/billing/billing-service", () => ({
  recordBillingEvent: vi.fn(),
}));

vi.mock("@/services/billing/subscription-service", () => ({
  applyStripeCheckoutCompleted: vi.fn(),
  applyStripeInvoice: vi.fn(),
  applyStripeSubscription: vi.fn(),
}));

vi.mock("@/services/storefront/storefront-stripe-checkout-service", () => ({
  applyStorefrontOrderCheckoutCompleted: vi.fn(),
}));

vi.mock("@/services/audit/audit-service", () => ({
  auditLog: vi.fn(),
}));

import { POST } from "@/app/api/webhooks/stripe/route";

describe("stripe webhook fail-closed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStripeClient.mockReturnValue({ webhooks: { constructEvent: vi.fn() } });
    headersMock.mockResolvedValue(new Headers());
  });

  it("returns 503 when STRIPE_WEBHOOK_SECRET is not configured", async () => {
    const prev = process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const res = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      }),
    );

    expect(res.status).toBe(503);
    if (prev) process.env.STRIPE_WEBHOOK_SECRET = prev;
  });

  it("returns 401 when signature header is missing but secret is configured", async () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    headersMock.mockResolvedValue(new Headers());

    const res = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      }),
    );

    expect(res.status).toBe(401);
  });
});

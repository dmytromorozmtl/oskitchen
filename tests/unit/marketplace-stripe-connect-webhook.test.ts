import { beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

const prismaMock = vi.hoisted(() => ({
  billingEvent: {
    findUnique: vi.fn(),
  },
  vendor: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
  },
  marketplacePurchaseOrder: {
    findUnique: vi.fn(),
  },
  vendorTransaction: {
    updateMany: vi.fn(),
  },
}));

const recordBillingEventMock = vi.hoisted(() => vi.fn());
const dispatchVendorWebhookEventMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/services/billing/billing-service", () => ({
  recordBillingEvent: recordBillingEventMock,
}));
vi.mock("@/services/marketplace/vendor-api-service", () => ({
  dispatchVendorWebhookEvent: dispatchVendorWebhookEventMock,
}));
vi.mock("@/lib/billing/stripe-client", () => ({
  getStripeClient: vi.fn(() => null),
  safeStripeError: (error: unknown) => (error instanceof Error ? error.message : "stripe error"),
}));

import {
  isAllowedMarketplaceConnectWebhookEvent,
  MARKETPLACE_CONNECT_WEBHOOK_EVENTS,
} from "@/lib/marketplace/stripe-connect-config";
import {
  handleMarketplaceStripeWebhookEvent,
  isDuplicateMarketplaceConnectWebhook,
} from "@/services/marketplace/stripe-connect-service";

describe("marketplace stripe connect webhook policy", () => {
  it("allows payout and transfer events", () => {
    expect(MARKETPLACE_CONNECT_WEBHOOK_EVENTS).toContain("payout.paid");
    expect(MARKETPLACE_CONNECT_WEBHOOK_EVENTS).toContain("transfer.created");
    expect(isAllowedMarketplaceConnectWebhookEvent("payout.paid")).toBe(true);
    expect(isAllowedMarketplaceConnectWebhookEvent("invoice.paid")).toBe(false);
  });
});

describe("marketplace stripe connect webhook handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.billingEvent.findUnique.mockResolvedValue(null);
    prismaMock.vendor.findUnique.mockResolvedValue({
      id: "vendor-1",
      stripeAccountId: "acct_vendor",
      workspaceId: "vendor-ws",
      workspace: { ownerUserId: "owner-1" },
    });
    prismaMock.vendor.findFirst.mockResolvedValue({
      id: "vendor-1",
      workspaceId: "vendor-ws",
      stripeAccountId: "acct_vendor",
      workspace: { ownerUserId: "owner-1" },
    });
    prismaMock.vendorTransaction.updateMany.mockResolvedValue({ count: 2 });
    recordBillingEventMock.mockResolvedValue(undefined);
    dispatchVendorWebhookEventMock.mockResolvedValue({ delivered: 1, failed: 0 });
  });

  it("detects duplicate stripe event ids", async () => {
    prismaMock.billingEvent.findUnique.mockResolvedValue({ id: "existing" });
    await expect(isDuplicateMarketplaceConnectWebhook("evt_dup")).resolves.toBe(true);
  });

  it("confirms transfer.created against vendor destination and payout id", async () => {
    const event = {
      id: "evt_transfer",
      type: "transfer.created",
      account: "acct_vendor",
      data: {
        object: {
          id: "tr_123",
          destination: "acct_vendor",
          metadata: { vendorId: "vendor-1", payoutId: "PAYOUT-ABC" },
        },
      },
    } as Stripe.Event;

    await handleMarketplaceStripeWebhookEvent(event);

    expect(prismaMock.vendorTransaction.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          vendorId: "vendor-1",
          payoutId: "PAYOUT-ABC",
        }),
      }),
    );
    expect(recordBillingEventMock).toHaveBeenCalled();
  });

  it("dispatches payout_processed on payout.paid for connected account", async () => {
    const event = {
      id: "evt_payout",
      type: "payout.paid",
      account: "acct_vendor",
      data: {
        object: {
          id: "po_123",
          amount: 125075,
          currency: "usd",
          status: "paid",
          arrival_date: 1_700_000_000,
        },
      },
    } as Stripe.Event;

    await handleMarketplaceStripeWebhookEvent(event);

    expect(dispatchVendorWebhookEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        vendorId: "vendor-1",
        event: "payout_processed",
        data: expect.objectContaining({
          payoutId: "po_123",
          amount: 1250.75,
          currency: "USD",
        }),
      }),
    );
  });

  it("reverts vendor transactions on transfer.reversed", async () => {
    const event = {
      id: "evt_reverse",
      type: "transfer.reversed",
      account: "acct_vendor",
      data: {
        object: {
          id: "tr_rev",
          metadata: { vendorId: "vendor-1", payoutId: "PAYOUT-ABC" },
        },
      },
    } as Stripe.Event;

    await handleMarketplaceStripeWebhookEvent(event);

    expect(prismaMock.vendorTransaction.updateMany).toHaveBeenCalledWith({
      where: { vendorId: "vendor-1", payoutId: "PAYOUT-ABC", status: "PAID_OUT" },
      data: { status: "AVAILABLE", payoutId: null },
    });
  });
});

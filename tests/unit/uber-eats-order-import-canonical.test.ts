import { describe, expect, it } from "vitest";

import { IntegrationProvider, NormalizedOrderStatus } from "@prisma/client";

import {
  fetchUberEatsOrders,
  getUberEatsCapabilitySnapshot,
} from "@/services/integrations/uber-eats/uber-eats-service";
import { normalizeUberEatsMarketplaceOrder } from "@/services/integrations/uber-eats/uber-eats-marketplace";

describe("Uber Eats marketplace normalization", () => {
  it("maps poll/webhook payload to canonical kitchen order", () => {
    const normalized = normalizeUberEatsMarketplaceOrder({
      id: "ue-order-1",
      state: "ACCEPTED",
      eater: { first_name: "Alex", last_name: "Guest", phone: "+15551234567" },
      cart: {
        items: [{ title: "Burger", quantity: 2, price: { unit_price: 899 } }],
      },
      payment: { total: 1798, currency_code: "USD" },
    });

    expect(normalized.provider).toBe(IntegrationProvider.UBER_EATS);
    expect(normalized.externalOrderId).toBe("ue-order-1");
    expect(normalized.customer.name).toBe("Alex Guest");
    expect(normalized.lineItems).toHaveLength(1);
    expect(normalized.totals.total).toBe(17.98);
    expect(normalized.normalizedStatus).toBe(NormalizedOrderStatus.CONFIRMED);
  });
});

describe("Uber Eats order import capability", () => {
  it("stays disabled without credentials", async () => {
    delete process.env.UBER_EATS_CLIENT_ID;
    delete process.env.UBER_EATS_CLIENT_SECRET;
    delete process.env.UBER_EATS_STORE_ID;

    expect(getUberEatsCapabilitySnapshot()).toMatchObject({
      hasCredentials: false,
      placeholderMode: true,
      liveImportReady: false,
    });

    await expect(fetchUberEatsOrders("owner-1")).rejects.toThrow("Uber Eats order import disabled");
  });

  it("enables LIVE import when credentials are configured", () => {
    process.env.UBER_EATS_CLIENT_ID = "client-id";
    process.env.UBER_EATS_CLIENT_SECRET = "client-secret";
    process.env.UBER_EATS_STORE_ID = "store-1";

    expect(getUberEatsCapabilitySnapshot()).toMatchObject({
      hasCredentials: true,
      placeholderMode: false,
      liveImportReady: true,
    });
  });
});

import { describe, expect, it } from "vitest";
import { createHmac } from "crypto";

import { IntegrationProvider, NormalizedOrderStatus } from "@prisma/client";

import {
  normalizeGrubhubOrder,
  verifyGrubhubWebhookSignature,
} from "@/services/integrations/grubhub/grubhub-marketplace";
import {
  fetchGrubhubOrders,
  getGrubhubCapabilitySnapshot,
} from "@/services/integrations/grubhub/grubhub-service";

describe("Grubhub marketplace normalization", () => {
  it("maps poll/webhook payload to canonical kitchen order", () => {
    const normalized = normalizeGrubhubOrder({
      uuid: "gh-order-1",
      status: "CONFIRMED",
      diner: { name: "Grubhub Guest", phone: "+15551234567" },
      charges: {
        line_items: [{ name: "Tacos", quantity: 2, price: 650 }],
        total: 1300,
      },
      fulfillment: { address: "456 Oak Ave" },
    });

    expect(normalized.provider).toBe(IntegrationProvider.GRUBHUB);
    expect(normalized.externalOrderId).toBe("gh-order-1");
    expect(normalized.customer.name).toBe("Grubhub Guest");
    expect(normalized.fulfillment.type).toBe("DELIVERY");
    expect(normalized.lineItems).toHaveLength(1);
    expect(normalized.totals.total).toBe(13);
    expect(normalized.normalizedStatus).toBe(NormalizedOrderStatus.CONFIRMED);
  });
});

describe("verifyGrubhubWebhookSignature", () => {
  const secret = "gh-webhook-secret";
  const body = '{"event_id":"evt-1","order":{"uuid":"order-1"}}';

  it("accepts hex digest", () => {
    const sig = createHmac("sha256", secret).update(body, "utf8").digest("hex");
    expect(verifyGrubhubWebhookSignature(body, sig, secret)).toBe(true);
  });
});

describe("Grubhub order import capability", () => {
  it("stays disabled without credentials", async () => {
    delete process.env.GRUBHUB_API_KEY;
    delete process.env.GRUBHUB_MERCHANT_ID;

    expect(getGrubhubCapabilitySnapshot()).toMatchObject({
      hasCredentials: false,
      placeholderMode: true,
      liveOrderReady: false,
    });

    await expect(fetchGrubhubOrders("owner-1")).rejects.toThrow("Grubhub order import disabled");
  });

  it("enables BETA import when credentials are configured", () => {
    process.env.GRUBHUB_API_KEY = "gh-api-key";
    process.env.GRUBHUB_MERCHANT_ID = "merchant-1";

    expect(getGrubhubCapabilitySnapshot()).toMatchObject({
      hasCredentials: true,
      placeholderMode: false,
      liveOrderReady: true,
    });
  });
});

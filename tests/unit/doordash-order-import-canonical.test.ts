import { describe, expect, it } from "vitest";
import { createHmac } from "crypto";

import { IntegrationProvider, NormalizedOrderStatus } from "@prisma/client";

import {
  normalizeDoorDashOrder,
  verifyDoorDashWebhookSignature,
} from "@/services/integrations/doordash/doordash-marketplace";
import {
  fetchDoorDashOrders,
  getDoorDashCapabilitySnapshot,
} from "@/services/integrations/doordash/doordash-service";

describe("DoorDash marketplace normalization", () => {
  it("maps marketplace poll payload to canonical kitchen order", () => {
    const normalized = normalizeDoorDashOrder({
      id: "dd-order-1",
      total: 2550,
      customer: { name: "DoorDash Guest" },
      delivery: { address: "123 Main St" },
      items: [{ name: "Bowl", quantity: 1, price: 2550 }],
    });

    expect(normalized.provider).toBe(IntegrationProvider.DOORDASH);
    expect(normalized.externalOrderId).toBe("dd-order-1");
    expect(normalized.customer.name).toBe("DoorDash Guest");
    expect(normalized.fulfillment.type).toBe("DELIVERY");
    expect(normalized.lineItems).toHaveLength(1);
    expect(normalized.totals.total).toBe(25.5);
    expect(normalized.normalizedStatus).toBe(NormalizedOrderStatus.OPEN);
  });

  it("unwraps nested webhook order payloads", () => {
    const normalized = normalizeDoorDashOrder({
      event_type: "order.created",
      order: {
        id: "nested-1",
        status: "cancelled",
        items: [],
      },
    });

    expect(normalized.externalOrderId).toBe("nested-1");
    expect(normalized.normalizedStatus).toBe(NormalizedOrderStatus.CANCELLED);
  });
});

describe("verifyDoorDashWebhookSignature", () => {
  const secret = "dd-webhook-secret";
  const body = '{"event_id":"evt-1","order":{"id":"order-1"}}';

  it("accepts hex digest", () => {
    const sig = createHmac("sha256", secret).update(body, "utf8").digest("hex");
    expect(verifyDoorDashWebhookSignature(body, sig, secret)).toBe(true);
  });

  it("accepts v1= prefixed digest", () => {
    const sig = createHmac("sha256", secret).update(body, "utf8").digest("hex");
    expect(verifyDoorDashWebhookSignature(body, `v1=${sig}`, secret)).toBe(true);
  });
});

describe("DoorDash order import capability", () => {
  it("stays disabled without credentials", async () => {
    delete process.env.DOORDASH_API_KEY;
    delete process.env.DOORDASH_MERCHANT_ID;

    expect(getDoorDashCapabilitySnapshot()).toMatchObject({
      hasCredentials: false,
      placeholderMode: true,
      liveImportReady: false,
    });

    await expect(fetchDoorDashOrders("owner-1")).rejects.toThrow("DoorDash order import disabled");
  });

  it("enables BETA import when credentials are configured", () => {
    process.env.DOORDASH_API_KEY = "dd-api-key";
    process.env.DOORDASH_MERCHANT_ID = "merchant-1";

    expect(getDoorDashCapabilitySnapshot()).toMatchObject({
      hasCredentials: true,
      placeholderMode: false,
      liveImportReady: true,
    });
  });
});

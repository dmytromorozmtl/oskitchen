import { describe, expect, it } from "vitest";

import { IntegrationProvider, NormalizedOrderStatus } from "@prisma/client";

import {
  normalizeSkipOrder,
  verifySkipWebhookSignature,
} from "@/services/integrations/skip/skip-marketplace";

describe("Skip marketplace normalization", () => {
  it("maps webhook payload to canonical kitchen order", () => {
    const normalized = normalizeSkipOrder({
      id: "skip-order-1",
      status: "confirmed",
      customer: { first_name: "Sam", last_name: "Guest" },
      items: [{ name: "Poutine", quantity: 1, price: 1299 }],
      totals: { total: 1299, currency: "CAD" },
    });

    expect(normalized.provider).toBe(IntegrationProvider.SKIP);
    expect(normalized.externalOrderId).toBe("skip-order-1");
    expect(normalized.customer.name).toBe("Sam Guest");
    expect(normalized.lineItems).toHaveLength(1);
    expect(normalized.normalizedStatus).toBe(NormalizedOrderStatus.CONFIRMED);
  });
});

describe("Skip webhook signature", () => {
  it("verifies HMAC hex signature", () => {
    const body = '{"event":"order.created"}';
    const secret = "skip-webhook-secret";
    const crypto = require("crypto") as typeof import("crypto");
    const sig = crypto.createHmac("sha256", secret).update(body).digest("hex");
    expect(verifySkipWebhookSignature(body, sig, secret)).toBe(true);
  });
});

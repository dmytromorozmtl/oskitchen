import { describe, expect, it } from "vitest";

import {
  normalizeWooSubscription,
} from "@/services/integrations/woocommerce-subscriptions-service";

describe("woocommerce-subscriptions-service", () => {
  it("normalizes Woo subscription REST payload", () => {
    const row = normalizeWooSubscription({
      id: 42,
      status: "active",
      billing_period: "month",
      billing_interval: 1,
      total: "49.00",
      currency: "USD",
      next_payment_date: "2026-06-15T00:00:00",
      billing: { email: "guest@example.com" },
      line_items: [{ name: "Weekly meal box" }],
    });

    expect(row.externalSubscriptionId).toBe("42");
    expect(row.status).toBe("active");
    expect(row.customerEmail).toBe("guest@example.com");
    expect(row.billingPeriod).toBe("month");
    expect(row.productNames).toEqual(["Weekly meal box"]);
  });
});

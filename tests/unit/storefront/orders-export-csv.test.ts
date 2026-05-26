import { describe, expect, it } from "vitest";

import { storefrontOrdersToCsv } from "@/lib/storefront/orders-export-csv";

describe("storefrontOrdersToCsv", () => {
  it("includes market and tax columns", () => {
    const csv = storefrontOrdersToCsv([
      {
        id: "ord-1",
        createdAt: new Date("2026-05-17T12:00:00.000Z"),
        customerName: "Alex",
        customerEmail: "a@example.com",
        status: "CONFIRMED",
        fulfillmentType: "PICKUP",
        creationSource: "STOREFRONT",
        total: { toString: () => "42.5" },
        storefront: {
          internalOrderId: "ord-1",
          storefrontOrderId: "sfo-1",
          orderNumber: "SF-ABC",
          storeSlug: "hello",
          currency: "CAD",
          marketId: "weekday",
          marketName: "Weekday picks",
          taxMode: "ca_sales",
          taxRegionCode: "CA-BC",
          taxTotal: 3.5,
          taxBreakdownJson: '[{"id":"gst","label":"GST","amount":2}]',
          schemaVersion: 2,
          source: "storefront:market:weekday",
          totals: { subtotal: 35, tax: 3.5, deliveryFee: 4, discount: 0, total: 42.5 },
        },
      },
    ]);

    expect(csv).toContain("market_id");
    expect(csv).toContain("tax_total");
    expect(csv).toContain("weekday");
    expect(csv).toContain("ca_sales");
    expect(csv).toContain("3.5");
  });
});

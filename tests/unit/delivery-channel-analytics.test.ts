import { describe, expect, it } from "vitest";

import {
  buildDeliveryChannelAnalyticsSnapshot,
  DELIVERY_MARKETPLACE_PROVIDERS,
} from "@/services/analytics/delivery-channel-analytics";

describe("delivery channel analytics", () => {
  const from = new Date("2026-05-01T00:00:00.000Z");
  const to = new Date("2026-05-31T23:59:59.999Z");

  it("aggregates revenue and import health per marketplace provider", () => {
    const snapshot = buildDeliveryChannelAnalyticsSnapshot({
      from,
      to,
      connectedProviders: ["DOORDASH", "UBER_EATS"],
      internalOrders: [
        {
          status: "COMPLETED",
          total: 42.5,
          fulfillmentType: "DELIVERY",
          createdAt: new Date("2026-05-10T12:00:00.000Z"),
          importedFromExternal: { provider: "DOORDASH", deliveryFee: 4.99 },
        },
        {
          status: "COMPLETED",
          total: 18,
          fulfillmentType: "PICKUP",
          createdAt: new Date("2026-05-11T12:00:00.000Z"),
          importedFromExternal: { provider: "UBER_EATS", deliveryFee: 0 },
        },
        {
          status: "CANCELLED",
          total: 99,
          fulfillmentType: "DELIVERY",
          createdAt: new Date("2026-05-12T12:00:00.000Z"),
          importedFromExternal: { provider: "DOORDASH", deliveryFee: 1 },
        },
      ],
      externalOrders: [
        {
          provider: "DOORDASH",
          syncStatus: "SUCCESS",
          total: 42.5,
          deliveryFee: 4.99,
          fulfillmentType: "DELIVERY",
          importedOrderId: "order-1",
        },
        {
          provider: "DOORDASH",
          syncStatus: "FAILED",
          total: 10,
          deliveryFee: 1,
          fulfillmentType: "DELIVERY",
          importedOrderId: null,
        },
        {
          provider: "GRUBHUB",
          syncStatus: "PENDING",
          total: 25,
          deliveryFee: 2,
          fulfillmentType: "DELIVERY",
          importedOrderId: null,
        },
      ],
    });

    expect(snapshot.totalOrders).toBe(2);
    expect(snapshot.totalRevenue).toBe(60.5);
    expect(snapshot.totalDeliveryFees).toBe(4.99);
    expect(snapshot.topChannel?.provider).toBe("DOORDASH");

    const doordash = snapshot.channels.find((c) => c.provider === "DOORDASH");
    const uber = snapshot.channels.find((c) => c.provider === "UBER_EATS");
    const grubhub = snapshot.channels.find((c) => c.provider === "GRUBHUB");

    expect(doordash).toMatchObject({
      orders: 1,
      revenue: 42.5,
      deliveryFees: 4.99,
      deliveryOrders: 1,
      externalStagingCount: 2,
      importedCount: 1,
      failedImports: 1,
      connected: true,
    });
    expect(uber).toMatchObject({
      orders: 1,
      revenue: 18,
      pickupOrders: 1,
      connected: true,
    });
    expect(grubhub).toMatchObject({
      orders: 0,
      externalStagingCount: 1,
      pendingImports: 1,
      connected: false,
    });
    expect(snapshot.dailyTrend).toEqual([
      { date: "2026-05-10", orders: 1 },
      { date: "2026-05-11", orders: 1 },
    ]);
  });

  it("covers all delivery marketplace providers", () => {
    const snapshot = buildDeliveryChannelAnalyticsSnapshot({
      from,
      to,
      connectedProviders: [],
      internalOrders: [],
      externalOrders: [],
    });

    expect(snapshot.channels.map((c) => c.provider)).toEqual([...DELIVERY_MARKETPLACE_PROVIDERS]);
    expect(snapshot.overallImportSuccessRate).toBeNull();
  });
});

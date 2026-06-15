import { describe, expect, it } from "vitest";

import {
  buildUnifiedCustomerProfileSnapshot,
  buildUnifiedProfileHubRow,
  buildUnifiedProfileHubSnapshot,
  buildUnifiedProfileLoyaltySnapshot,
  buildUnifiedProfileOrderRow,
} from "@/lib/crm/unified-profile-builders";
import {
  UNIFIED_PROFILE_PATH,
  UNIFIED_PROFILE_POLICY_ID,
  UNIFIED_PROFILE_SERVICE,
} from "@/lib/crm/unified-profile-policy";

describe("Unified Customer Profile", () => {
  it("locks policy constants", () => {
    expect(UNIFIED_PROFILE_POLICY_ID).toBe("crm-unified-profile-v1");
    expect(UNIFIED_PROFILE_SERVICE).toBe("services/crm/unified-profile-service.ts");
    expect(UNIFIED_PROFILE_PATH).toBe("/dashboard/customers/unified-profile");
  });

  it("builds order row with href", () => {
    const row = buildUnifiedProfileOrderRow({
      id: "order-1",
      status: "COMPLETED",
      fulfillmentType: "DELIVERY",
      total: 42.5,
      createdAt: new Date("2026-06-01T12:00:00.000Z"),
    });

    expect(row.total).toBe(42.5);
    expect(row.href).toBe("/dashboard/orders/order-1");
  });

  it("builds loyalty snapshot", () => {
    const loyalty = buildUnifiedProfileLoyaltySnapshot({
      pointsBalance: 320,
      tier: "GOLD",
      transactions: [
        {
          id: "tx-1",
          type: "EARN",
          points: 50,
          createdAt: new Date("2026-06-01T12:00:00.000Z"),
          notes: "Order earn",
        },
      ],
    });

    expect(loyalty.pointsBalance).toBe(320);
    expect(loyalty.recentTransactions).toHaveLength(1);
  });

  it("assembles unified customer profile snapshot", () => {
    const snapshot = buildUnifiedCustomerProfileSnapshot({
      customerId: "cust-1",
      identity: {
        displayName: "Jane Doe",
        email: "jane@example.com",
        phone: "+15551234567",
        type: "Individual",
        status: "Active",
        source: "Storefront",
        companyName: null,
      },
      metrics: {
        totalOrders: 12,
        lifetimeValueCents: 125000,
        averageOrderValueCents: 10416,
        lastOrderAt: new Date("2026-06-01T12:00:00.000Z"),
        firstOrderAt: new Date("2025-01-01T12:00:00.000Z"),
        atRiskScore: 12,
      },
      preferences: {
        allergies: ["peanuts"],
        dietary: ["vegetarian"],
        dislikes: [],
        favorites: ["house salad"],
        tags: ["vip"],
        preferredFulfillment: "DELIVERY",
        marketingConsent: true,
        smsConsent: false,
      },
      orders: [
        buildUnifiedProfileOrderRow({
          id: "order-1",
          status: "COMPLETED",
          fulfillmentType: "DELIVERY",
          total: 42.5,
          createdAt: new Date("2026-06-01T12:00:00.000Z"),
        }),
      ],
      history: [],
      loyalty: buildUnifiedProfileLoyaltySnapshot({
        pointsBalance: 100,
        tier: "STANDARD",
        transactions: [],
      }),
      segments: ["VIP"],
      mealPlanCount: 1,
    });

    expect(snapshot.policyId).toBe(UNIFIED_PROFILE_POLICY_ID);
    expect(snapshot.basePath).toBe(UNIFIED_PROFILE_PATH);
    expect(snapshot.href).toBe("/dashboard/customers/unified-profile/cust-1");
    expect(snapshot.metrics.lifetimeValueUsd).toBe(1250);
    expect(snapshot.metrics.averageOrderValueUsd).toBe(104.16);
    expect(snapshot.orders).toHaveLength(1);
    expect(snapshot.segments).toEqual(["VIP"]);
  });

  it("assembles hub snapshot summary", () => {
    const hub = buildUnifiedProfileHubSnapshot({
      customers: [
        buildUnifiedProfileHubRow({
          customerId: "cust-1",
          displayName: "Jane Doe",
          email: "jane@example.com",
          totalOrders: 5,
          lifetimeValueCents: 50000,
          loyaltyPoints: 120,
          lastOrderAt: new Date("2026-06-01T12:00:00.000Z"),
        }),
        buildUnifiedProfileHubRow({
          customerId: "cust-2",
          displayName: "John Smith",
          email: "john@example.com",
          totalOrders: 0,
          lifetimeValueCents: 0,
          loyaltyPoints: null,
          lastOrderAt: null,
        }),
      ],
    });

    expect(hub.summary.totalCustomers).toBe(2);
    expect(hub.summary.withOrders).toBe(1);
    expect(hub.summary.withLoyalty).toBe(1);
  });
});

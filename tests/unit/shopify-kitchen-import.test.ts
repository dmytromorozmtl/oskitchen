import { beforeEach, describe, expect, it, vi } from "vitest";

const persistResolvedOrder = vi.hoisted(() => vi.fn());
const prismaMock = vi.hoisted(() => ({
  externalOrder: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/services/orders/order-creation-service", () => ({ persistResolvedOrder }));

import { IntegrationProvider } from "@prisma/client";

import { importShopifyOrderToKitchen } from "@/services/integrations/shopify/kitchen-import.service";

describe("shopify kitchen import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistResolvedOrder.mockResolvedValue({ orderId: "kitchen-shopify-1" });
    prismaMock.externalOrder.findFirst.mockResolvedValue({ importedOrderId: null });
    prismaMock.externalOrder.update.mockResolvedValue({});
  });

  it("imports normalized order to kitchen", async () => {
    const result = await importShopifyOrderToKitchen({
      userId: "owner-1",
      workspaceId: "ws-1",
      connectionId: "conn-1",
      externalOrderRecordId: "ext-1",
      normalized: {
        provider: IntegrationProvider.SHOPIFY,
        externalOrderId: "1001",
        lineItems: [{ title: "Latte", quantity: 2, unitPrice: 5, sku: "LATTE-01" }],
        customer: { name: "Sam", email: "sam@example.com" },
        fulfillment: { type: "PICKUP" },
        totals: { total: 10 },
        normalizedStatus: "CONFIRMED",
        raw: { id: 1001 },
      },
    });

    expect(result.imported).toBe(true);
    expect(persistResolvedOrder).toHaveBeenCalledWith(
      { userId: "owner-1", workspaceId: "ws-1" },
      expect.objectContaining({
        channelProvider: IntegrationProvider.SHOPIFY,
        externalOrderId: "1001",
      }),
    );
  });
});

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

import { importWooCommerceOrderToKitchen } from "@/services/integrations/woocommerce/kitchen-import.service";

describe("woocommerce kitchen import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistResolvedOrder.mockResolvedValue({ orderId: "kitchen-woo-1" });
    prismaMock.externalOrder.findFirst.mockResolvedValue({ importedOrderId: null });
    prismaMock.externalOrder.update.mockResolvedValue({});
  });

  it("imports normalized order to kitchen", async () => {
    const result = await importWooCommerceOrderToKitchen({
      userId: "owner-1",
      workspaceId: "ws-1",
      connectionId: "conn-1",
      externalOrderRecordId: "ext-1",
      normalized: {
        provider: IntegrationProvider.WOOCOMMERCE,
        externalOrderId: "501",
        lineItems: [{ title: "Meal Kit", quantity: 1, unitPrice: 24, sku: "MK-01" }],
        customer: { name: "Alex", email: "alex@example.com" },
        fulfillment: { type: "DELIVERY" },
        totals: { total: 24 },
        normalizedStatus: "CONFIRMED",
        raw: { id: 501 },
      },
    });

    expect(result.imported).toBe(true);
    expect(persistResolvedOrder).toHaveBeenCalledWith(
      { userId: "owner-1", workspaceId: "ws-1" },
      expect.objectContaining({
        channelProvider: IntegrationProvider.WOOCOMMERCE,
        externalOrderId: "501",
      }),
    );
  });
});

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

import { importUberEatsOrderToKitchen } from "@/services/integrations/uber-eats/kitchen-import.service";

describe("uber-eats kitchen import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistResolvedOrder.mockResolvedValue({ orderId: "kitchen-order-1" });
    prismaMock.externalOrder.findFirst.mockResolvedValue({ importedOrderId: null });
    prismaMock.externalOrder.update.mockResolvedValue({});
  });

  it("imports normalized order to kitchen and links external order", async () => {
    const result = await importUberEatsOrderToKitchen({
      userId: "owner-1",
      workspaceId: "ws-1",
      connectionId: "conn-1",
      externalOrderRecordId: "ext-1",
      normalized: {
        provider: IntegrationProvider.UBER_EATS,
        externalOrderId: "ue-99",
        lineItems: [{ title: "Burger", quantity: 1, unitPrice: 12 }],
        customer: { name: "Alex" },
        fulfillment: { type: "PICKUP" },
        totals: { total: 12 },
        normalizedStatus: "CONFIRMED",
        raw: { id: "ue-99" },
      },
    });

    expect(result.imported).toBe(true);
    expect(result.orderId).toBe("kitchen-order-1");
    expect(persistResolvedOrder).toHaveBeenCalledWith(
      { userId: "owner-1", workspaceId: "ws-1" },
      expect.objectContaining({
        channelProvider: IntegrationProvider.UBER_EATS,
        externalOrderId: "ue-99",
      }),
    );
    expect(prismaMock.externalOrder.update).toHaveBeenCalledWith({
      where: { id: "ext-1" },
      data: { importedOrderId: "kitchen-order-1", syncStatus: "SYNCED" },
    });
  });

  it("skips duplicate kitchen import", async () => {
    prismaMock.externalOrder.findFirst.mockResolvedValue({
      importedOrderId: "existing-order",
    });

    const result = await importUberEatsOrderToKitchen({
      userId: "owner-1",
      connectionId: "conn-1",
      externalOrderRecordId: "ext-1",
      normalized: {
        provider: IntegrationProvider.UBER_EATS,
        externalOrderId: "ue-99",
        lineItems: [{ title: "Burger", quantity: 1, unitPrice: 12 }],
        customer: {},
        fulfillment: { type: "PICKUP" },
        totals: {},
        normalizedStatus: "CONFIRMED",
        raw: {},
      },
    });

    expect(result.duplicate).toBe(true);
    expect(persistResolvedOrder).not.toHaveBeenCalled();
  });
});

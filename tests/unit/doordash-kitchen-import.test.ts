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

import { importDoorDashOrderToKitchen } from "@/services/integrations/doordash/kitchen-import.service";

describe("doordash kitchen import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistResolvedOrder.mockResolvedValue({ orderId: "kitchen-order-dd-1" });
    prismaMock.externalOrder.findFirst.mockResolvedValue({ importedOrderId: null });
    prismaMock.externalOrder.update.mockResolvedValue({});
  });

  it("imports normalized order to kitchen and links external order", async () => {
    const result = await importDoorDashOrderToKitchen({
      userId: "owner-1",
      workspaceId: "ws-1",
      connectionId: "conn-1",
      externalOrderRecordId: "ext-1",
      normalized: {
        provider: IntegrationProvider.DOORDASH,
        externalOrderId: "dd-99",
        lineItems: [{ title: "Bowl", quantity: 1, unitPrice: 14 }],
        customer: { name: "Sam" },
        fulfillment: { type: "DELIVERY" },
        totals: { total: 14 },
        normalizedStatus: "CONFIRMED",
        raw: { id: "dd-99" },
      },
    });

    expect(result.imported).toBe(true);
    expect(result.orderId).toBe("kitchen-order-dd-1");
    expect(persistResolvedOrder).toHaveBeenCalledWith(
      { userId: "owner-1", workspaceId: "ws-1" },
      expect.objectContaining({
        channelProvider: IntegrationProvider.DOORDASH,
        externalOrderId: "dd-99",
      }),
    );
  });
});

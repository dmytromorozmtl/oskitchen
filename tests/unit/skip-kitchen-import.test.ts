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

import { importSkipOrderToKitchen } from "@/services/integrations/skip/kitchen-import.service";

describe("skip kitchen import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistResolvedOrder.mockResolvedValue({ orderId: "kitchen-skip-1" });
    prismaMock.externalOrder.findFirst.mockResolvedValue({ importedOrderId: null });
    prismaMock.externalOrder.update.mockResolvedValue({});
  });

  it("imports normalized order to kitchen", async () => {
    const result = await importSkipOrderToKitchen({
      userId: "owner-1",
      workspaceId: "ws-1",
      connectionId: "conn-1",
      externalOrderRecordId: "ext-1",
      normalized: {
        provider: IntegrationProvider.SKIP,
        externalOrderId: "skip-99",
        lineItems: [{ title: "Burger", quantity: 1, unitPrice: 12 }],
        customer: { name: "Alex" },
        fulfillment: { type: "PICKUP" },
        totals: { total: 12 },
        normalizedStatus: "CONFIRMED",
        raw: { id: "skip-99" },
      },
    });

    expect(result.imported).toBe(true);
    expect(persistResolvedOrder).toHaveBeenCalledWith(
      { userId: "owner-1", workspaceId: "ws-1" },
      expect.objectContaining({
        channelProvider: IntegrationProvider.SKIP,
        externalOrderId: "skip-99",
      }),
    );
  });
});

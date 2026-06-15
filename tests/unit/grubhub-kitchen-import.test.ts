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

import { importGrubhubOrderToKitchen } from "@/services/integrations/grubhub/kitchen-import.service";

describe("grubhub kitchen import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistResolvedOrder.mockResolvedValue({ orderId: "kitchen-gh-1" });
    prismaMock.externalOrder.findFirst.mockResolvedValue({ importedOrderId: null });
    prismaMock.externalOrder.update.mockResolvedValue({});
  });

  it("imports normalized order to kitchen", async () => {
    const result = await importGrubhubOrderToKitchen({
      userId: "owner-1",
      workspaceId: "ws-1",
      connectionId: "conn-1",
      externalOrderRecordId: "ext-1",
      normalized: {
        provider: IntegrationProvider.GRUBHUB,
        externalOrderId: "gh-99",
        lineItems: [{ title: "Burger", quantity: 1, unitPrice: 12 }],
        customer: { name: "Alex" },
        fulfillment: { type: "PICKUP" },
        totals: { total: 12 },
        normalizedStatus: "CONFIRMED",
        raw: { uuid: "gh-99" },
      },
    });

    expect(result.imported).toBe(true);
    expect(persistResolvedOrder).toHaveBeenCalledWith(
      { userId: "owner-1", workspaceId: "ws-1" },
      expect.objectContaining({
        channelProvider: IntegrationProvider.GRUBHUB,
        externalOrderId: "gh-99",
      }),
    );
  });
});

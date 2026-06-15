import { beforeEach, describe, expect, it, vi } from "vitest";

const persistNormalizedExternalOrder = vi.hoisted(() => vi.fn());
const markWebhookProcessed = vi.hoisted(() => vi.fn());
const importUberEatsOrderToKitchen = vi.hoisted(() => vi.fn());

vi.mock("@/lib/integrations/persist-external-order", () => ({
  persistNormalizedExternalOrder,
}));
vi.mock("@/lib/webhooks/webhook-event-store", () => ({
  createWebhookEvent: vi.fn(),
  markWebhookProcessed,
}));
vi.mock("@/services/integrations/uber-eats/kitchen-import.service", () => ({
  importUberEatsOrderToKitchen,
}));

import { processUberEatsInboundOrder } from "@/services/integrations/uber-eats/inbound-order.service";

describe("uber-eats inbound webhook kitchen path", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistNormalizedExternalOrder.mockResolvedValue({ id: "ext-1" });
    markWebhookProcessed.mockResolvedValue(undefined);
    importUberEatsOrderToKitchen.mockResolvedValue({
      imported: true,
      orderId: "kitchen-order-1",
    });
  });

  it("processUberEatsInboundOrder returns importedOrderId", async () => {
    const result = await processUberEatsInboundOrder({
      userId: "owner-1",
      connectionId: "conn-1",
      externalEventId: "evt-1",
      webhookEventId: "webhook-1",
      payload: {
        id: "ue-1",
        state: "ACCEPTED",
        cart: { items: [{ title: "Bowl", quantity: 1, price: { unit_price: 1000 } }] },
        payment: { total: 1000 },
      },
    });

    expect(result.ok).toBe(true);
    expect(result.importedOrderId).toBe("kitchen-order-1");
    expect(importUberEatsOrderToKitchen).toHaveBeenCalled();
  });
});

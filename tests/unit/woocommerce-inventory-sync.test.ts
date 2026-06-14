import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  integrationConnection: { findFirst: vi.fn() },
  externalProduct: { findFirst: vi.fn() },
  storefrontInventoryItem: { findFirst: vi.fn(), upsert: vi.fn() },
  product: { findFirst: vi.fn(), updateMany: vi.fn() },
  storefrontSettings: { findFirst: vi.fn() },
}));

const getWooCommerceCredentials = vi.hoisted(() => vi.fn());
const pushWooInventoryLevel = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/integrations/decrypt-connection", () => ({ getWooCommerceCredentials }));
vi.mock("@/services/integrations/shopify-inventory", () => ({ pushWooInventoryLevel }));

import { IntegrationProvider } from "@prisma/client";

import { syncWooCommerceInventoryFromOrder } from "@/services/integrations/woocommerce/inventory-sync.service";
import { syncWooCommerceInventoryFromProductWebhook } from "@/services/integrations/woocommerce/inventory-sync.service";

describe("woocommerce inventory sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.integrationConnection.findFirst.mockResolvedValue({
      id: "conn-1",
      provider: IntegrationProvider.WOOCOMMERCE,
      baseUrl: "https://woo.test",
    });
    getWooCommerceCredentials.mockReturnValue({
      baseUrl: "https://woo.test",
      consumerKey: "ck",
      consumerSecret: "cs",
    });
    pushWooInventoryLevel.mockResolvedValue({ ok: true });
    prismaMock.externalProduct.findFirst.mockResolvedValue({
      mappedProductId: "prod-1",
      externalProductId: "88",
    });
    prismaMock.storefrontInventoryItem.findFirst.mockResolvedValue({ quantity: 12 });
    prismaMock.storefrontSettings.findFirst.mockResolvedValue({ id: "sf-1" });
    prismaMock.storefrontInventoryItem.upsert.mockResolvedValue({});
  });

  it("decrements mapped kitchen stock and pushes to WooCommerce", async () => {
    const result = await syncWooCommerceInventoryFromOrder({
      userId: "owner-1",
      connectionId: "conn-1",
      normalized: {
        provider: IntegrationProvider.WOOCOMMERCE,
        externalOrderId: "501",
        lineItems: [{ title: "Meal Kit", quantity: 2, unitPrice: 24, sku: "MK-01" }],
        customer: {},
        fulfillment: { type: "PICKUP" },
        totals: { total: 48 },
        normalizedStatus: "CONFIRMED",
        raw: {},
      },
    });

    expect(result.adjusted).toBe(1);
    expect(result.pushed).toBe(1);
    expect(pushWooInventoryLevel).toHaveBeenCalledWith(
      expect.anything(),
      "88",
      10,
    );
  });

  it("pulls Woo product.updated stock into mapped kitchen inventory", async () => {
    prismaMock.externalProduct.findFirst.mockResolvedValue({
      mappedProductId: "prod-1",
    });
    prismaMock.storefrontInventoryItem.findFirst.mockResolvedValue({ quantity: 5 });
    prismaMock.storefrontSettings.findFirst.mockResolvedValue({ id: "sf-1" });
    prismaMock.storefrontInventoryItem.upsert.mockResolvedValue({});

    const result = await syncWooCommerceInventoryFromProductWebhook({
      userId: "owner-1",
      connectionId: "conn-1",
      externalProductId: "88",
      stockQuantity: 15,
    });

    expect(result.updated).toBe(true);
    expect(result.productId).toBe("prod-1");
    expect(result.quantity).toBe(15);
    expect(prismaMock.storefrontInventoryItem.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { quantity: 15 },
      }),
    );
  });
});

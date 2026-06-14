import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  integrationConnection: { findFirst: vi.fn() },
  externalProduct: { findFirst: vi.fn() },
  storefrontInventoryItem: { findFirst: vi.fn(), upsert: vi.fn() },
  product: { findFirst: vi.fn(), updateMany: vi.fn() },
  storefrontSettings: { findFirst: vi.fn() },
}));

const getShopifyCredentials = vi.hoisted(() => vi.fn());
const fetchShopifyPrimaryLocationId = vi.hoisted(() => vi.fn());
const pushShopifyInventoryLevel = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/integrations/decrypt-connection", () => ({ getShopifyCredentials }));
vi.mock("@/services/integrations/shopify-inventory", () => ({
  extractShopifyInventoryItemId: () => "inv-99",
  fetchShopifyPrimaryLocationId,
  pushShopifyInventoryLevel,
}));

import { IntegrationProvider } from "@prisma/client";

import { syncShopifyInventoryFromOrder } from "@/services/integrations/shopify/inventory-sync.service";

describe("shopify inventory sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.integrationConnection.findFirst.mockResolvedValue({
      id: "conn-1",
      provider: IntegrationProvider.SHOPIFY,
      settingsJson: {},
    });
    getShopifyCredentials.mockReturnValue({
      shopDomain: "test.myshopify.com",
      adminAccessToken: "token",
    });
    fetchShopifyPrimaryLocationId.mockResolvedValue("loc-1");
    pushShopifyInventoryLevel.mockResolvedValue({ ok: true });
    prismaMock.externalProduct.findFirst.mockResolvedValue({
      mappedProductId: "prod-1",
      rawPayloadJson: { variant: { inventoryItem: { id: "gid://shopify/InventoryItem/99" } } },
    });
    prismaMock.storefrontInventoryItem.findFirst.mockResolvedValue({ quantity: 10 });
    prismaMock.storefrontSettings.findFirst.mockResolvedValue({ id: "sf-1" });
    prismaMock.storefrontInventoryItem.upsert.mockResolvedValue({});
  });

  it("decrements mapped kitchen stock and pushes to Shopify", async () => {
    const result = await syncShopifyInventoryFromOrder({
      userId: "owner-1",
      connectionId: "conn-1",
      normalized: {
        provider: IntegrationProvider.SHOPIFY,
        externalOrderId: "1001",
        lineItems: [{ title: "Latte", quantity: 2, unitPrice: 5, sku: "LATTE-01" }],
        customer: {},
        fulfillment: { type: "PICKUP" },
        totals: { total: 10 },
        normalizedStatus: "CONFIRMED",
        raw: {},
      },
      rawPayload: {},
    });

    expect(result.adjusted).toBe(1);
    expect(result.pushed).toBe(1);
    expect(pushShopifyInventoryLevel).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ quantity: 8 }),
    );
  });

  it("pulls Shopify products/update inventory into mapped kitchen stock", async () => {
    prismaMock.externalProduct.findFirst.mockResolvedValue({
      mappedProductId: "prod-1",
    });
    prismaMock.storefrontInventoryItem.findFirst.mockResolvedValue({ quantity: 5 });
    prismaMock.storefrontSettings.findFirst.mockResolvedValue({ id: "sf-1" });
    prismaMock.storefrontInventoryItem.upsert.mockResolvedValue({});

    const { syncShopifyInventoryFromProductWebhook } = await import(
      "@/services/integrations/shopify/inventory-sync.service"
    );

    const result = await syncShopifyInventoryFromProductWebhook({
      userId: "owner-1",
      connectionId: "conn-1",
      externalProductId: "5001",
      externalVariantId: "90001",
      inventoryQuantity: 15,
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

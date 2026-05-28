import { readFileSync } from "node:fs";
import { join } from "node:path";

import { IntegrationProvider } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  CHANNEL_GOLDEN_PATH_FIXTURES,
  CHANNEL_GOLDEN_PATH_POLICY_ID,
  CHANNEL_GOLDEN_PATH_STAGES,
} from "@/lib/integrations/channel-golden-path-policy";
import { executeShopifyWebhookBusinessLogic } from "@/lib/webhooks/shopify-webhook-processor";
import { executeWooCommerceWebhookBusinessLogic } from "@/lib/webhooks/woocommerce-webhook-processor";
import { normalizeShopifyRestOrder } from "@/services/integrations/shopify";
import { normalizeWooOrder } from "@/services/integrations/woocommerce";

const ROOT = process.cwd();

const mockPersist = vi.fn(async () => ({ id: "ext-1" }));
const mockStage = vi.fn(async () => "batch-1");
const mockConnUpdate = vi.fn(async () => ({}));
const mockConnFindFirst = vi.fn(async () => ({
  id: "conn-1",
  userId: "user-1",
  provider: IntegrationProvider.SHOPIFY,
}));

vi.mock("@/lib/integrations/persist-external-order", () => ({
  persistNormalizedExternalOrder: (...args: unknown[]) => mockPersist(...args),
}));

vi.mock("@/lib/channels/import-staging", () => ({
  stageWebhookOrderIngest: (...args: unknown[]) => mockStage(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    workspace: {
      findFirst: vi.fn(async () => ({ id: "ws-1" })),
    },
    integrationConnection: {
      findFirst: (...args: unknown[]) => mockConnFindFirst(...args),
      update: (...args: unknown[]) => mockConnUpdate(...args),
    },
  },
}));

function loadFixture(rel: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(ROOT, rel), "utf8")) as Record<string, unknown>;
}

describe("channel golden path (Woo / Shopify)", () => {
  beforeEach(() => {
    mockPersist.mockClear();
    mockStage.mockClear();
    mockConnUpdate.mockClear();
    mockConnFindFirst.mockClear();
    mockConnFindFirst.mockResolvedValue({
      id: "conn-1",
      userId: "user-1",
      provider: IntegrationProvider.SHOPIFY,
    });
  });

  it("locks era4 golden-path policy id and stages", () => {
    expect(CHANNEL_GOLDEN_PATH_POLICY_ID).toBe("era4-channel-golden-path-v1");
    expect(CHANNEL_GOLDEN_PATH_STAGES).toEqual([
      "normalize",
      "persist_external_order",
      "stage_channel_import",
      "order_hub_visibility",
    ]);
  });

  it("normalizes Woo fixture with SKU + contact for VALID staging", () => {
    const raw = loadFixture(CHANNEL_GOLDEN_PATH_FIXTURES.woocommerceOrder);
    const normalized = normalizeWooOrder(raw);
    expect(normalized.provider).toBe(IntegrationProvider.WOOCOMMERCE);
    expect(normalized.externalOrderId).toBe("9001");
    expect(normalized.lineItems[0]?.sku).toBe("GOLDEN-WOO-1");
    expect(normalized.customer.email).toBe("woo-golden@example.invalid");
  });

  it("normalizes Shopify fixture with SKU + contact for VALID staging", () => {
    const raw = loadFixture(CHANNEL_GOLDEN_PATH_FIXTURES.shopifyOrder);
    const normalized = normalizeShopifyRestOrder(raw);
    expect(normalized.provider).toBe(IntegrationProvider.SHOPIFY);
    expect(normalized.externalOrderId).toBe("5001001");
    expect(normalized.lineItems[0]?.sku).toBe("GOLDEN-SHOPIFY-1");
    expect(normalized.customer.email).toBe("shopify-golden@example.invalid");
  });

  it("Woo webhook processor persists external order and stages channel import", async () => {
    const raw = loadFixture(CHANNEL_GOLDEN_PATH_FIXTURES.woocommerceOrder);
    await executeWooCommerceWebhookBusinessLogic({
      userId: "user-1",
      connectionId: "conn-woo",
      webhookEventId: "wh-woo-1",
      topic: "order.updated",
      payload: raw,
    });

    expect(mockPersist).toHaveBeenCalledTimes(1);
    expect(mockPersist.mock.calls[0]?.[0]).toMatchObject({
      userId: "user-1",
      connectionId: "conn-woo",
      normalized: expect.objectContaining({
        provider: IntegrationProvider.WOOCOMMERCE,
        externalOrderId: "9001",
      }),
    });

    expect(mockStage).toHaveBeenCalledTimes(1);
    expect(mockStage.mock.calls[0]?.[0]).toMatchObject({
      userId: "user-1",
      connectionId: "conn-woo",
      provider: IntegrationProvider.WOOCOMMERCE,
      webhookEventId: "wh-woo-1",
    });
    expect(mockConnUpdate).toHaveBeenCalled();
  });

  it("Shopify webhook processor persists external order and stages channel import", async () => {
    mockConnFindFirst.mockResolvedValue({
      id: "conn-shopify",
      userId: "user-1",
      provider: IntegrationProvider.SHOPIFY,
    });
    const raw = loadFixture(CHANNEL_GOLDEN_PATH_FIXTURES.shopifyOrder);
    await executeShopifyWebhookBusinessLogic({
      userId: "user-1",
      connectionId: "conn-shopify",
      webhookEventId: "wh-shopify-1",
      topic: "orders/create",
      payload: raw,
    });

    expect(mockPersist).toHaveBeenCalledTimes(1);
    expect(mockPersist.mock.calls[0]?.[0]).toMatchObject({
      userId: "user-1",
      connectionId: "conn-shopify",
      normalized: expect.objectContaining({
        provider: IntegrationProvider.SHOPIFY,
        externalOrderId: "5001001",
      }),
    });

    expect(mockStage).toHaveBeenCalledTimes(1);
    expect(mockStage.mock.calls[0]?.[0]).toMatchObject({
      provider: IntegrationProvider.SHOPIFY,
      webhookEventId: "wh-shopify-1",
    });
    expect(mockConnUpdate).toHaveBeenCalled();
  });
});

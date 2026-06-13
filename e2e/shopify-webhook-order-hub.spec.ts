import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

import { CHANNEL_GOLDEN_PATH_FIXTURES } from "@/lib/integrations/channel-golden-path-policy";
import {
  SHOPIFY_ORDER_HUB_PROVIDER_LABEL,
  SHOPIFY_WEBHOOK_ORDER_HUB_E2E_POLICY_ID,
  SHOPIFY_WEBHOOK_PATH,
  SHOPIFY_WEBHOOK_TOPIC_ORDERS_CREATE,
  isShopifyOrderWebhookTopic,
  signShopifyWebhookBody,
} from "@/lib/integrations/shopify-webhook-order-hub-e2e-policy";
import {
  ORDER_HUB_PATH,
  WOOCOMMERCE_WEBHOOK_PATH,
} from "@/lib/integrations/woocommerce-webhook-order-hub-e2e-policy";
import { normalizeShopifyRestOrder, verifyShopifyHmac } from "@/services/integrations/shopify";

import { ingestShopifyWebhookAndAssertOrderHub } from "./helpers/shopify-webhook-order-hub-flow";
import {
  skipShopifyWebhookOrderHubIfNoDb,
  skipShopifyWebhookOrderHubIfNotAuthed,
} from "./helpers/shopify-webhook-order-hub-ready";

/**
 * Shopify webhook → order hub E2E (P3-53 integration pack).
 *
 * Signed orders/create webhook ingest → external order row visible on Order hub.
 */

test.describe("shopify webhook order hub policy", () => {
  test("exports webhook and order hub route contract", () => {
    expect(SHOPIFY_WEBHOOK_ORDER_HUB_E2E_POLICY_ID).toBe(
      "shopify-webhook-order-hub-e2e-v1",
    );
    expect(SHOPIFY_WEBHOOK_PATH).toBe("/api/webhooks/shopify/orders-create");
    expect(ORDER_HUB_PATH).toBe("/dashboard/order-hub");
    expect(SHOPIFY_ORDER_HUB_PROVIDER_LABEL).toBe("Shopify");
    expect(isShopifyOrderWebhookTopic(SHOPIFY_WEBHOOK_TOPIC_ORDERS_CREATE)).toBe(true);
    expect(isShopifyOrderWebhookTopic("products/update")).toBe(false);
    expect(SHOPIFY_WEBHOOK_PATH).not.toBe(WOOCOMMERCE_WEBHOOK_PATH);
  });

  test("normalizes golden-path Shopify fixture for order hub ingest", () => {
    const raw = JSON.parse(
      readFileSync(join(process.cwd(), CHANNEL_GOLDEN_PATH_FIXTURES.shopifyOrder), "utf8"),
    ) as Record<string, unknown>;
    const normalized = normalizeShopifyRestOrder(raw);
    expect(normalized.externalOrderId).toBe("5001001");
    expect(normalized.customer.name).toContain("Shopify");
    expect(normalized.lineItems[0]?.sku).toBe("GOLDEN-SHOPIFY-1");
  });

  test("HMAC signature roundtrip matches verifyShopifyHmac", () => {
    const secret = "shpwhsec-e2e-test";
    const body = JSON.stringify({ id: 1, name: "#1001" });
    const sig = signShopifyWebhookBody(body, secret);
    expect(verifyShopifyHmac(body, sig, secret)).toBe(true);
  });
});

test.describe("shopify webhook order hub (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Shopify webhook→order hub runs in chromium-authed project only",
    );
    skipShopifyWebhookOrderHubIfNotAuthed();
    skipShopifyWebhookOrderHubIfNoDb();
  });

  test("signed webhook creates Shopify row on order hub", async ({ page, request }) => {
    await ingestShopifyWebhookAndAssertOrderHub(request, page);
  });
});

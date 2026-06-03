import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

import {
  CHANNEL_GOLDEN_PATH_FIXTURES,
} from "@/lib/integrations/channel-golden-path-policy";
import {
  ORDER_HUB_PATH,
  WOOCOMMERCE_ORDER_HUB_PROVIDER_LABEL,
  WOOCOMMERCE_WEBHOOK_ORDER_HUB_E2E_POLICY_ID,
  WOOCOMMERCE_WEBHOOK_PATH,
  isWooCommerceOrderWebhookTopic,
  woocommerceWebhookUrl,
} from "@/lib/integrations/woocommerce-webhook-order-hub-e2e-policy";
import { normalizeWooOrder, verifyWebhookSignature } from "@/services/integrations/woocommerce";

import { ingestWooWebhookAndAssertOrderHub } from "./helpers/woocommerce-webhook-order-hub-flow";
import {
  signWooWebhookBody,
  skipWooWebhookOrderHubIfNoDb,
  skipWooWebhookOrderHubIfNotAuthed,
} from "./helpers/woocommerce-webhook-order-hub-ready";

/**
 * WooCommerce webhook → order hub E2E.
 *
 * Signed order.updated webhook ingest → external order row visible on Order hub.
 *
 * @see scripts/smoke-woocommerce-live.ts — live store proof
 * @see e2e/webhook-replay.spec.ts — webhook replay baseline
 */

test.describe("woocommerce webhook order hub policy", () => {
  test("exports webhook and order hub route contract", () => {
    expect(WOOCOMMERCE_WEBHOOK_ORDER_HUB_E2E_POLICY_ID).toBe(
      "woocommerce-webhook-order-hub-e2e-v1",
    );
    expect(WOOCOMMERCE_WEBHOOK_PATH).toBe("/api/webhooks/woocommerce");
    expect(ORDER_HUB_PATH).toBe("/dashboard/order-hub");
    expect(WOOCOMMERCE_ORDER_HUB_PROVIDER_LABEL).toBe("WooCommerce");
    expect(isWooCommerceOrderWebhookTopic("order.updated")).toBe(true);
    expect(isWooCommerceOrderWebhookTopic("product.updated")).toBe(false);
    expect(woocommerceWebhookUrl("conn-1")).toBe("/api/webhooks/woocommerce?cid=conn-1");
  });

  test("normalizes golden-path Woo fixture for order hub ingest", () => {
    const raw = JSON.parse(
      readFileSync(join(process.cwd(), CHANNEL_GOLDEN_PATH_FIXTURES.woocommerceOrder), "utf8"),
    ) as Record<string, unknown>;
    const normalized = normalizeWooOrder(raw);
    expect(normalized.externalOrderId).toBe("9001");
    expect(normalized.customer.name).toBe("Woo Guest");
    expect(normalized.lineItems[0]?.sku).toBe("GOLDEN-WOO-1");
  });

  test("HMAC signature roundtrip matches verifyWebhookSignature", () => {
    const secret = "whsec-e2e-test";
    const body = JSON.stringify({ id: 1, status: "processing" });
    const sig = signWooWebhookBody(body, secret);
    expect(verifyWebhookSignature(body, sig, secret)).toBe(true);
  });
});

test.describe("woocommerce webhook order hub (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "WooCommerce webhook→order hub runs in chromium-authed project only",
    );
    skipWooWebhookOrderHubIfNotAuthed();
    skipWooWebhookOrderHubIfNoDb();
  });

  test("signed webhook creates WooCommerce row on order hub", async ({ page, request }) => {
    await ingestWooWebhookAndAssertOrderHub(request, page);
  });
});

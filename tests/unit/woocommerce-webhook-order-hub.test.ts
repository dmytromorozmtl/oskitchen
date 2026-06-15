import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { CHANNEL_GOLDEN_PATH_FIXTURES } from "@/lib/integrations/channel-golden-path-policy";
import {
  ORDER_HUB_PATH,
  WOOCOMMERCE_WEBHOOK_ORDER_HUB_E2E_POLICY_ID,
  isWooCommerceOrderWebhookTopic,
  signWooWebhookBody,
  woocommerceWebhookUrl,
} from "@/lib/integrations/woocommerce-webhook-order-hub-e2e-policy";
import { normalizeWooOrder, verifyWebhookSignature } from "@/services/integrations/woocommerce";

describe("WooCommerce webhook → order hub lifecycle (QA-19)", () => {
  it("exports E2E webhook and order hub paths", () => {
    expect(WOOCOMMERCE_WEBHOOK_ORDER_HUB_E2E_POLICY_ID).toBe(
      "woocommerce-webhook-order-hub-e2e-v1",
    );
    expect(ORDER_HUB_PATH).toBe("/dashboard/order-hub");
    expect(woocommerceWebhookUrl("abc")).toBe("/api/webhooks/woocommerce?cid=abc");
    expect(isWooCommerceOrderWebhookTopic("order.created")).toBe(true);
  });

  it("normalizes Woo order fixture with customer for hub display", () => {
    const raw = JSON.parse(
      readFileSync(join(process.cwd(), CHANNEL_GOLDEN_PATH_FIXTURES.woocommerceOrder), "utf8"),
    ) as Record<string, unknown>;
    const normalized = normalizeWooOrder(raw);
    expect(normalized.externalOrderNumber).toBe("9001");
    expect(normalized.customer.name).toBe("Woo Guest");
    expect(normalized.lineItems).toHaveLength(1);
  });

  it("signs webhook bodies for staging ingest", () => {
    const body = '{"id":9001,"status":"processing"}';
    const sig = signWooWebhookBody(body, "secret");
    expect(verifyWebhookSignature(body, sig, "secret")).toBe(true);
  });
});

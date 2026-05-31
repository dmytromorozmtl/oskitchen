import { describe, expect, it } from "vitest";

import {
  computeShopifyMarketPriceHash,
  isShopifyMarketsWebhookDebounced,
  SHOPIFY_MARKETS_WEBHOOK_DEBOUNCE_MS,
} from "@/lib/storefront/revalidate-shopify-market-catalog";
import {
  isShopifyMarketsPriceWebhookTopic,
} from "@/lib/webhooks/shopify-markets-webhook-service";

describe("shopify-markets-webhook-service", () => {
  it("recognizes price-related Shopify webhook topics", () => {
    expect(isShopifyMarketsPriceWebhookTopic("products/update")).toBe(true);
    expect(isShopifyMarketsPriceWebhookTopic("markets/create")).toBe(true);
    expect(isShopifyMarketsPriceWebhookTopic("markets/update")).toBe(true);
    expect(isShopifyMarketsPriceWebhookTopic("markets/delete")).toBe(true);
    expect(isShopifyMarketsPriceWebhookTopic("orders/create")).toBe(false);
    expect(isShopifyMarketsPriceWebhookTopic("app/uninstalled")).toBe(false);
  });

  it("debounces webhook imports within 60 seconds", () => {
    const now = Date.parse("2026-05-31T12:00:00.000Z");
    const recent = "2026-05-31T11:59:30.000Z";
    const stale = "2026-05-31T11:58:00.000Z";

    expect(isShopifyMarketsWebhookDebounced(recent, now)).toBe(true);
    expect(isShopifyMarketsWebhookDebounced(stale, now)).toBe(false);
    expect(isShopifyMarketsWebhookDebounced(null, now)).toBe(false);
    expect(SHOPIFY_MARKETS_WEBHOOK_DEBOUNCE_MS).toBe(60_000);
  });

  it("computes stable price hash independent of key order", () => {
    const a = computeShopifyMarketPriceHash({
      "product-b": "12.50",
      "product-a": "14.99",
    });
    const b = computeShopifyMarketPriceHash({
      "product-a": "14.99",
      "product-b": "12.50",
    });
    expect(a).toBe(b);
    expect(a).toHaveLength(16);

    const changed = computeShopifyMarketPriceHash({
      "product-a": "15.99",
      "product-b": "12.50",
    });
    expect(changed).not.toBe(a);
  });
});

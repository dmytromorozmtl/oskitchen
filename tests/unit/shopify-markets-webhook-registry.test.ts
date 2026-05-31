import { describe, expect, it } from "vitest";

import {
  callbackUrlsMatch,
  computeWebhookDriftStatus,
  driftStatusLabel,
  expectedShopifyMarketsWebhookCallbackUrl,
  SHOPIFY_MARKETS_WEBHOOK_TOPICS,
} from "@/lib/commercial/shopify-markets-webhook-registry";
import {
  buildWebhookRegistryRows,
  indexSubscriptionsByGraphqlTopic,
  loadWebhookRegistryFixture,
  parseShopifyWebhookSubscriptionsGraphQLResponse,
} from "@/services/integrations/shopify-markets-webhook-registry-service";

describe("shopify-markets-webhook-registry", () => {
  it("parses webhook subscriptions fixture", () => {
    const nodes = parseShopifyWebhookSubscriptionsGraphQLResponse(loadWebhookRegistryFixture());
    expect(nodes).toHaveLength(2);
    expect(nodes[0]?.topic).toBe("MARKETS_CREATE");
    expect(nodes[0]?.callbackUrl).toContain("markets-create");
  });

  it("builds expected callback URLs for all markets topics", () => {
    for (const def of SHOPIFY_MARKETS_WEBHOOK_TOPICS) {
      const url = expectedShopifyMarketsWebhookCallbackUrl(def.routeSegment);
      expect(url).toContain(`/api/webhooks/shopify/${def.routeSegment}`);
    }
  });

  it("detects drift statuses", () => {
    const now = Date.parse("2026-06-01T12:00:00.000Z");
    expect(
      computeWebhookDriftStatus({
        shopifySubscriptionId: null,
        expectedCallbackUrl: "https://a.test/x",
        actualCallbackUrl: null,
        lastDeliveryAt: null,
        registeredAt: null,
        now,
      }),
    ).toBe("missing");

    expect(
      computeWebhookDriftStatus({
        shopifySubscriptionId: "gid://shopify/WebhookSubscription/1",
        expectedCallbackUrl: "https://a.test/x",
        actualCallbackUrl: "https://b.test/y",
        lastDeliveryAt: null,
        registeredAt: null,
        now,
      }),
    ).toBe("wrong_url");

    expect(
      computeWebhookDriftStatus({
        shopifySubscriptionId: "gid://shopify/WebhookSubscription/1",
        expectedCallbackUrl: "https://a.test/x",
        actualCallbackUrl: "https://a.test/x",
        lastDeliveryAt: "2026-05-30T12:00:00.000Z",
        registeredAt: "2026-05-29T12:00:00.000Z",
        now,
      }),
    ).toBe("stale");

    expect(driftStatusLabel("ok")).toBe("Healthy");
    expect(callbackUrlsMatch("https://A.test/x/", "https://a.test/x")).toBe(true);
  });

  it("builds registry rows with subscription index", () => {
    const marketsCreateUrl = expectedShopifyMarketsWebhookCallbackUrl("markets-create");
    const productsUpdateUrl = "https://wrong.example.com/api/webhooks/shopify/products-update";
    const nodes = indexSubscriptionsByGraphqlTopic([
      {
        id: "gid://shopify/WebhookSubscription/1111111111",
        topic: "MARKETS_CREATE",
        callbackUrl: marketsCreateUrl,
      },
      {
        id: "gid://shopify/WebhookSubscription/2222222222",
        topic: "PRODUCTS_UPDATE",
        callbackUrl: productsUpdateUrl,
      },
    ]);
    const syncedAt = "2026-06-01T12:00:00.000Z";
    const registry = buildWebhookRegistryRows({
      subscriptionsByTopic: nodes,
      deliveriesByTopic: new Map([
        ["markets/create", { lastDeliveryAt: syncedAt, failureCount: 0 }],
      ]),
      previousRegistry: {},
      syncedAt,
    });

    expect(registry["markets/create"]?.driftStatus).toBe("ok");
    expect(registry["markets/update"]?.driftStatus).toBe("missing");
    expect(registry["products/update"]?.driftStatus).toBe("wrong_url");
  });
});

describe("shopify-markets-webhook-service topics", () => {
  it("still recognizes markets webhook topics", async () => {
    const { isShopifyMarketsPriceWebhookTopic } = await import(
      "@/lib/webhooks/shopify-markets-webhook-service"
    );
    expect(isShopifyMarketsPriceWebhookTopic("markets/update")).toBe(true);
  });
});

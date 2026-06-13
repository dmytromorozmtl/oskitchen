/**
 * Shopify webhook → order hub E2E policy (P3-53 integration pack).
 *
 * @see e2e/shopify-webhook-order-hub.spec.ts
 * @see lib/webhooks/shopify-handler.ts
 */

import { createHmac } from "node:crypto";

export const SHOPIFY_WEBHOOK_ORDER_HUB_E2E_POLICY_ID =
  "shopify-webhook-order-hub-e2e-v1" as const;

export const SHOPIFY_WEBHOOK_PATH = "/api/webhooks/shopify/orders-create" as const;
export const SHOPIFY_WEBHOOK_TOPIC_ORDERS_CREATE = "orders/create" as const;
export const SHOPIFY_ORDER_HUB_PROVIDER_LABEL = "Shopify" as const;

export const SHOPIFY_WEBHOOK_ORDER_HUB_VISIBLE_MS = 15_000 as const;

export function signShopifyWebhookBody(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
}

export function isShopifyOrderWebhookTopic(topic: string): boolean {
  return topic === SHOPIFY_WEBHOOK_TOPIC_ORDERS_CREATE || topic.startsWith("orders/");
}

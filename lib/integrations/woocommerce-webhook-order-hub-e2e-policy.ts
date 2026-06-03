/**
 * WooCommerce webhook → order hub E2E policy (QA-19).
 *
 * @see e2e/woocommerce-webhook-order-hub.spec.ts
 * @see lib/webhooks/woocommerce-handler.ts
 * @see app/dashboard/order-hub/page.tsx
 */

import { createHmac } from "node:crypto";

export const WOOCOMMERCE_WEBHOOK_ORDER_HUB_E2E_POLICY_ID =
  "woocommerce-webhook-order-hub-e2e-v1" as const;

export const WOOCOMMERCE_WEBHOOK_PATH = "/api/webhooks/woocommerce" as const;
export const ORDER_HUB_PATH = "/dashboard/order-hub" as const;
export const ORDER_HUB_ALL_TAB_QUERY = "?tab=all" as const;

export const WOOCOMMERCE_WEBHOOK_TOPIC_ORDER_UPDATED = "order.updated" as const;
export const WOOCOMMERCE_ORDER_HUB_PROVIDER_LABEL = "WooCommerce" as const;
export const ORDER_HUB_INCOMING_CHANNELS_HEADING = "Incoming channel orders" as const;

export const WOOCOMMERCE_WEBHOOK_ORDER_HUB_VISIBLE_MS = 15_000 as const;

export function woocommerceWebhookUrl(connectionId: string): string {
  return `${WOOCOMMERCE_WEBHOOK_PATH}?cid=${encodeURIComponent(connectionId)}`;
}

export function isWooCommerceOrderWebhookTopic(topic: string): boolean {
  return topic.startsWith("order.");
}

export function orderHubTabUrl(tab: string): string {
  return `${ORDER_HUB_PATH}?tab=${encodeURIComponent(tab)}`;
}

export function signWooWebhookBody(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
}

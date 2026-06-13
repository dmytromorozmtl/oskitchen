import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

import {
  ORDER_HUB_ALL_TAB_QUERY,
  ORDER_HUB_INCOMING_CHANNELS_HEADING,
  ORDER_HUB_PATH,
} from "@/lib/integrations/woocommerce-webhook-order-hub-e2e-policy";
import {
  SHOPIFY_ORDER_HUB_PROVIDER_LABEL,
  SHOPIFY_WEBHOOK_ORDER_HUB_VISIBLE_MS,
  SHOPIFY_WEBHOOK_PATH,
  SHOPIFY_WEBHOOK_TOPIC_ORDERS_CREATE,
} from "@/lib/integrations/shopify-webhook-order-hub-e2e-policy";
import { verifyShopifyHmac } from "@/services/integrations/shopify";

import {
  resolveShopifyWebhookOrderHubFixture,
  signShopifyWebhookBody,
  type ShopifyWebhookOrderHubFixture,
} from "./shopify-webhook-order-hub-ready";

export function buildE2EShopifyOrderWebhookPayload(stamp: string): Record<string, unknown> {
  return {
    id: Number(stamp.slice(-8)),
    name: `#${stamp}`,
    email: `e2e-shopify-${stamp}@example.invalid`,
    phone: "+1555010421",
    currency: "USD",
    subtotal_price: "38.00",
    total_tax: "3.04",
    total_price: "41.04",
    fulfillment_status: null,
    customer: {
      first_name: "E2E",
      last_name: "Shopify Guest",
    },
    line_items: [
      {
        id: 1,
        title: "E2E Test Wrap",
        quantity: 1,
        sku: "E2E-SHOPIFY-WRAP",
        price: "38.00",
      },
    ],
  };
}

export async function postSignedShopifyOrderWebhook(
  request: APIRequestContext,
  fixture: ShopifyWebhookOrderHubFixture,
  payload: Record<string, unknown>,
): Promise<{ queued: boolean }> {
  const rawBody = JSON.stringify(payload);
  const hmac = signShopifyWebhookBody(rawBody, fixture.webhookSecret);
  expect(verifyShopifyHmac(rawBody, hmac, fixture.webhookSecret)).toBe(true);

  const response = await request.post(SHOPIFY_WEBHOOK_PATH, {
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Topic": SHOPIFY_WEBHOOK_TOPIC_ORDERS_CREATE,
      "X-Shopify-Shop-Domain": fixture.shopDomain,
      "X-Shopify-Hmac-Sha256": hmac,
      "X-Shopify-Webhook-Id": `e2e-shopify-${Date.now()}`,
    },
    data: rawBody,
  });

  if (response.status() === 404) {
    test.skip(true, "Shopify connection not found — check SHOPIFY_SMOKE_CONNECTION_ID.");
  }
  if (response.status() === 401) {
    test.skip(true, "Invalid Shopify webhook signature — check webhook secret on connection.");
  }
  expect(response.ok()).toBe(true);

  const body = (await response.json()) as { queued?: boolean; duplicate?: boolean };
  if (body.queued) {
    test.skip(
      true,
      "Webhook queued async — set WEBHOOK_ASYNC_QUEUE=false and run webhook drain for E2E proof.",
    );
  }

  return { queued: Boolean(body.queued) };
}

export async function assertShopifyOrderVisibleOnOrderHub(
  page: Page,
  externalOrderNumber: string,
  customerName: string,
): Promise<void> {
  await page.goto(`${ORDER_HUB_PATH}${ORDER_HUB_ALL_TAB_QUERY}`);
  await expect(page.getByRole("heading", { name: /^Order hub$/i })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByRole("heading", { name: ORDER_HUB_INCOMING_CHANNELS_HEADING })).toBeVisible();

  await expect(page.getByText(externalOrderNumber)).toBeVisible({
    timeout: SHOPIFY_WEBHOOK_ORDER_HUB_VISIBLE_MS,
  });
  await expect(page.getByText(customerName)).toBeVisible();
  await expect(page.getByText(SHOPIFY_ORDER_HUB_PROVIDER_LABEL)).toBeVisible();
}

export async function ingestShopifyWebhookAndAssertOrderHub(
  request: APIRequestContext,
  page: Page,
): Promise<void> {
  const fixture = await resolveShopifyWebhookOrderHubFixture();
  if (!fixture) {
    test.skip(
      true,
      "SHOPIFY_SMOKE_CONNECTION_ID Shopify connection + shop domain + webhook secret required.",
    );
  }

  const stamp = `e2e${Date.now().toString().slice(-8)}`;
  const payload = buildE2EShopifyOrderWebhookPayload(stamp);
  await postSignedShopifyOrderWebhook(request, fixture, payload);
  await assertShopifyOrderVisibleOnOrderHub(page, `#${stamp}`, "E2E Shopify Guest");
}

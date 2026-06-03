import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

import {
  ORDER_HUB_ALL_TAB_QUERY,
  ORDER_HUB_INCOMING_CHANNELS_HEADING,
  ORDER_HUB_PATH,
  WOOCOMMERCE_ORDER_HUB_PROVIDER_LABEL,
  WOOCOMMERCE_WEBHOOK_ORDER_HUB_VISIBLE_MS,
  WOOCOMMERCE_WEBHOOK_TOPIC_ORDER_UPDATED,
  woocommerceWebhookUrl,
} from "@/lib/integrations/woocommerce-webhook-order-hub-e2e-policy";
import { verifyWebhookSignature } from "@/services/integrations/woocommerce";

import {
  resolveWooWebhookOrderHubFixture,
  signWooWebhookBody,
  type WooWebhookOrderHubFixture,
} from "./woocommerce-webhook-order-hub-ready";

export function buildE2EWooOrderWebhookPayload(stamp: string): Record<string, unknown> {
  return {
    id: stamp,
    number: stamp,
    status: "processing",
    currency: "USD",
    total: "42.50",
    customer_note: "E2E Woo webhook order hub",
    billing: {
      first_name: "E2E",
      last_name: "Woo Guest",
      email: `e2e-woo-${stamp}@example.invalid`,
      phone: "+1555010420",
    },
    shipping: {},
    line_items: [
      {
        id: 1,
        name: "E2E Test Bowl",
        quantity: 2,
        sku: "E2E-WOO-BOWL",
        price: "21.25",
      },
    ],
  };
}

export async function postSignedWooOrderWebhook(
  request: APIRequestContext,
  fixture: WooWebhookOrderHubFixture,
  payload: Record<string, unknown>,
): Promise<{ queued: boolean }> {
  const rawBody = JSON.stringify(payload);
  const signature = signWooWebhookBody(rawBody, fixture.webhookSecret);
  expect(verifyWebhookSignature(rawBody, signature, fixture.webhookSecret)).toBe(true);

  const deliveryId = `e2e-woo-${Date.now()}`;
  const response = await request.post(woocommerceWebhookUrl(fixture.connectionId), {
    headers: {
      "Content-Type": "application/json",
      "X-WC-Webhook-Topic": WOOCOMMERCE_WEBHOOK_TOPIC_ORDER_UPDATED,
      "X-WC-Webhook-Delivery-Id": deliveryId,
      "X-WC-Webhook-Signature": signature,
    },
    data: rawBody,
  });

  if (response.status() === 404) {
    test.skip(true, "WooCommerce connection not found — check CHANNEL_SMOKE_CONNECTION_ID.");
  }
  if (response.status() === 401) {
    test.skip(true, "Invalid WooCommerce webhook signature — check webhook secret on connection.");
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

export async function assertWooOrderVisibleOnOrderHub(
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
    timeout: WOOCOMMERCE_WEBHOOK_ORDER_HUB_VISIBLE_MS,
  });
  await expect(page.getByText(customerName)).toBeVisible();
  await expect(page.getByText(WOOCOMMERCE_ORDER_HUB_PROVIDER_LABEL)).toBeVisible();
}

export async function ingestWooWebhookAndAssertOrderHub(
  request: APIRequestContext,
  page: Page,
): Promise<void> {
  const fixture = await resolveWooWebhookOrderHubFixture();
  if (!fixture) {
    test.skip(
      true,
      "CHANNEL_SMOKE_CONNECTION_ID WooCommerce connection + webhook secret required.",
    );
  }

  const stamp = `e2e${Date.now().toString().slice(-8)}`;
  const payload = buildE2EWooOrderWebhookPayload(stamp);
  await postSignedWooOrderWebhook(request, fixture, payload);
  await assertWooOrderVisibleOnOrderHub(page, stamp, "E2E Woo Guest");
}

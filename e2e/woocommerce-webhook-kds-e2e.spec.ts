import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

import { CHANNEL_GOLDEN_PATH_FIXTURES } from "@/lib/integrations/channel-golden-path-policy";
import {
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_POLICY_ID,
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_REQUIRED_STEP_IDS,
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_SMOKE_SKU,
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_WEBHOOK_TOPIC,
} from "@/lib/integrations/woocommerce-webhook-kds-e2e-p0-13-policy";
import { normalizeWooOrder, verifyWebhookSignature } from "@/services/integrations/woocommerce";
import { buildWooCommerceWebhookKdsE2ETestPayload } from "@/services/integrations/woocommerce-webhook-kds-e2e-p0-13";

import { ingestWooWebhookAndAssertKds } from "./helpers/woocommerce-webhook-kds-e2e-flow";
import {
  signWooWebhookBody,
  skipWooWebhookOrderHubIfNoDb,
  skipWooWebhookOrderHubIfNotAuthed,
} from "./helpers/woocommerce-webhook-order-hub-ready";

/**
 * WooCommerce webhook → KDS E2E (P0-13).
 *
 * Test payload → WebhookEvent → KitchenTask → KDS ticket visible.
 *
 * @see scripts/smoke-woocommerce-live.ts — live store proof (P0-2)
 * @see e2e/woocommerce-webhook-order-hub.spec.ts — order hub variant
 */

test.describe("woocommerce webhook kds e2e policy (P0-13)", () => {
  test("exports P0-13 policy and four-step KDS chain", () => {
    expect(WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_POLICY_ID).toBe(
      "p0-13-woocommerce-webhook-kds-e2e-v1",
    );
    expect(WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_WEBHOOK_TOPIC).toBe("order.created");
    expect(WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_REQUIRED_STEP_IDS).toEqual([
      "test_payload",
      "webhook_event_persisted",
      "kitchen_task_linked",
      "kds_ticket_visible",
    ]);
  });

  test("builds synthetic test payload with golden-path SKU", () => {
    const payload = buildWooCommerceWebhookKdsE2ETestPayload("e2e-kds-9001");
    expect(payload.id).toBe("e2e-kds-9001");
    const lineItems = payload.line_items as Array<{ sku?: string }>;
    expect(lineItems[0]?.sku).toBe(WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_SMOKE_SKU);
  });

  test("normalizes golden-path Woo fixture for KDS ingest", () => {
    const raw = JSON.parse(
      readFileSync(join(process.cwd(), CHANNEL_GOLDEN_PATH_FIXTURES.woocommerceOrder), "utf8"),
    ) as Record<string, unknown>;
    const normalized = normalizeWooOrder(raw);
    expect(normalized.externalOrderId).toBe("9001");
    expect(normalized.lineItems[0]?.sku).toBe("GOLDEN-WOO-1");
  });

  test("HMAC signature roundtrip matches verifyWebhookSignature", () => {
    const secret = "whsec-e2e-kds-test";
    const body = JSON.stringify(buildWooCommerceWebhookKdsE2ETestPayload("9002"));
    const sig = signWooWebhookBody(body, secret);
    expect(verifyWebhookSignature(body, sig, secret)).toBe(true);
  });
});

test.describe("woocommerce webhook kds ticket (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "WooCommerce webhook→KDS runs in chromium-authed project only",
    );
    skipWooWebhookOrderHubIfNotAuthed();
    skipWooWebhookOrderHubIfNoDb();
  });

  test("test payload webhook creates KitchenTask visible on KDS", async ({ page }) => {
    const result = await ingestWooWebhookAndAssertKds(page);
    expect(result.importedOrderId.length).toBeGreaterThan(0);
    expect(result.kitchenTaskId?.length).toBeGreaterThan(0);
    expect(result.webhookEventId?.length).toBeGreaterThan(0);
  });
});

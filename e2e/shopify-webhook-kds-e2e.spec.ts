import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

import { CHANNEL_GOLDEN_PATH_FIXTURES } from "@/lib/integrations/channel-golden-path-policy";
import {
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_POLICY_ID,
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_REQUIRED_STEP_IDS,
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_SMOKE_SKU,
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_WEBHOOK_TOPIC,
} from "@/lib/integrations/shopify-webhook-kds-e2e-p0-14-policy";
import {
  signShopifyWebhookBody,
} from "@/lib/integrations/shopify-webhook-order-hub-e2e-policy";
import {
  buildShopifyWebhookKdsE2ETestPayload,
} from "@/services/integrations/shopify-webhook-kds-e2e-p0-14";
import { normalizeShopifyRestOrder, verifyShopifyHmac } from "@/services/integrations/shopify";

import { ingestShopifyWebhookAndAssertKds } from "./helpers/shopify-webhook-kds-e2e-flow";
import {
  skipShopifyWebhookOrderHubIfNoDb,
  skipShopifyWebhookOrderHubIfNotAuthed,
} from "./helpers/shopify-webhook-order-hub-ready";

/**
 * Shopify webhook → KDS E2E (P0-14).
 *
 * HMAC test payload → WebhookEvent → KitchenTask → KDS ticket visible.
 *
 * @see scripts/smoke-shopify-live.ts — live store proof (P0-3)
 * @see e2e/shopify-webhook-order-hub.spec.ts — order hub variant
 */

test.describe("shopify webhook kds e2e policy (P0-14)", () => {
  test("exports P0-14 policy and five-step KDS chain", () => {
    expect(SHOPIFY_WEBHOOK_KDS_E2E_P0_14_POLICY_ID).toBe(
      "p0-14-shopify-webhook-kds-e2e-v1",
    );
    expect(SHOPIFY_WEBHOOK_KDS_E2E_P0_14_WEBHOOK_TOPIC).toBe("orders/create");
    expect(SHOPIFY_WEBHOOK_KDS_E2E_P0_14_REQUIRED_STEP_IDS).toEqual([
      "hmac_self_check",
      "test_payload",
      "webhook_event_persisted",
      "kitchen_task_linked",
      "kds_ticket_visible",
    ]);
  });

  test("builds synthetic test payload with golden-path SKU", () => {
    const payload = buildShopifyWebhookKdsE2ETestPayload("5001999");
    expect(payload.id).toBe(5001999);
    const lineItems = payload.line_items as Array<{ sku?: string }>;
    expect(lineItems[0]?.sku).toBe(SHOPIFY_WEBHOOK_KDS_E2E_P0_14_SMOKE_SKU);
  });

  test("normalizes golden-path Shopify fixture for KDS ingest", () => {
    const raw = JSON.parse(
      readFileSync(join(process.cwd(), CHANNEL_GOLDEN_PATH_FIXTURES.shopifyOrder), "utf8"),
    ) as Record<string, unknown>;
    const normalized = normalizeShopifyRestOrder(raw);
    expect(normalized.externalOrderId).toBe("5001001");
    expect(normalized.lineItems[0]?.sku).toBe("GOLDEN-SHOPIFY-1");
  });

  test("HMAC signature roundtrip matches verifyShopifyHmac", () => {
    const secret = "shpwhsec-e2e-kds-test";
    const body = JSON.stringify(buildShopifyWebhookKdsE2ETestPayload("5002001"));
    const sig = signShopifyWebhookBody(body, secret);
    expect(verifyShopifyHmac(body, sig, secret)).toBe(true);
  });
});

test.describe("shopify webhook kds ticket (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Shopify webhook→KDS runs in chromium-authed project only",
    );
    skipShopifyWebhookOrderHubIfNotAuthed();
    skipShopifyWebhookOrderHubIfNoDb();
  });

  test("HMAC webhook creates KitchenTask visible on KDS", async ({ page }) => {
    const result = await ingestShopifyWebhookAndAssertKds(page);
    expect(result.importedOrderId.length).toBeGreaterThan(0);
    expect(result.kitchenTaskId?.length).toBeGreaterThan(0);
    expect(result.webhookEventId?.length).toBeGreaterThan(0);
  });
});

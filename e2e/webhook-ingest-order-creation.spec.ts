import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

import { CHANNEL_GOLDEN_PATH_FIXTURES } from "@/lib/integrations/channel-golden-path-policy";
import {
  ORDER_HUB_PATH,
  WEBHOOK_INGEST_ORDER_CREATION_E2E_POLICY_ID,
  WEBHOOK_INGEST_ORDER_CREATION_FLOW_STEPS,
  WOOCOMMERCE_WEBHOOK_PATH,
  isWooCommerceOrderWebhookTopic,
  signWooWebhookBody,
  storefrontKdsTicketTestId,
  woocommerceWebhookUrl,
} from "@/lib/qa/webhook-ingest-order-creation-e2e-policy";
import { normalizeWooOrder, verifyWebhookSignature } from "@/services/integrations/woocommerce";

import { runWebhookIngestOrderCreationFlow } from "./helpers/webhook-ingest-order-creation-flow";
import {
  skipWebhookIngestOrderCreationIfGateDisabled,
  skipWebhookIngestOrderCreationIfKdsGateDisabled,
  skipWebhookIngestOrderCreationIfNoConnection,
  skipWebhookIngestOrderCreationIfNoDb,
  skipWebhookIngestOrderCreationIfNotAuthed,
} from "./helpers/webhook-ingest-order-creation-ready";

/**
 * Webhook ingest → order creation golden path.
 *
 * Signed WooCommerce webhook → external order hub row → kitchen import → KDS ticket.
 *
 * @see e2e/woocommerce-webhook-order-hub.spec.ts
 * @see scripts/smoke-woocommerce-live.ts
 */

test.describe("webhook ingest order creation policy", () => {
  test("exports webhook processing routes and steps", () => {
    expect(WEBHOOK_INGEST_ORDER_CREATION_E2E_POLICY_ID).toBe(
      "webhook-ingest-order-creation-e2e-v1",
    );
    expect(WOOCOMMERCE_WEBHOOK_PATH).toBe("/api/webhooks/woocommerce");
    expect(ORDER_HUB_PATH).toBe("/dashboard/order-hub");
    expect(WEBHOOK_INGEST_ORDER_CREATION_FLOW_STEPS).toEqual([
      "webhook_ingest",
      "verify_external_order",
      "verify_kitchen_import",
      "verify_kds_ticket",
    ]);
    expect(isWooCommerceOrderWebhookTopic("order.updated")).toBe(true);
    expect(woocommerceWebhookUrl("conn-1")).toBe("/api/webhooks/woocommerce?cid=conn-1");
    expect(storefrontKdsTicketTestId("ord-1")).toBe("kds-ticket-ord-1");
  });

  test("normalizes golden-path Woo fixture for kitchen import", () => {
    const raw = JSON.parse(
      readFileSync(join(process.cwd(), CHANNEL_GOLDEN_PATH_FIXTURES.woocommerceOrder), "utf8"),
    ) as Record<string, unknown>;
    const normalized = normalizeWooOrder(raw);
    expect(normalized.externalOrderId).toBe("9001");
    expect(normalized.lineItems[0]?.sku).toBe("GOLDEN-WOO-1");
  });

  test("HMAC signature roundtrip matches verifyWebhookSignature", () => {
    const secret = "whsec-e2e-test";
    const body = JSON.stringify({ id: 1, status: "processing" });
    const sig = signWooWebhookBody(body, secret);
    expect(verifyWebhookSignature(body, sig, secret)).toBe(true);
  });
});

test.describe("webhook ingest order creation (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Webhook ingest → order creation runs in chromium-authed project only",
    );
    skipWebhookIngestOrderCreationIfGateDisabled();
    skipWebhookIngestOrderCreationIfNotAuthed();
    skipWebhookIngestOrderCreationIfNoDb();
    skipWebhookIngestOrderCreationIfNoConnection();
    skipWebhookIngestOrderCreationIfKdsGateDisabled();
  });

  test("signed webhook creates internal kitchen order and KDS ticket", async ({
    page,
    request,
  }) => {
    const result = await runWebhookIngestOrderCreationFlow(request, page);
    expect(result.steps).toEqual(WEBHOOK_INGEST_ORDER_CREATION_FLOW_STEPS);
    expect(result.externalOrderId.length).toBeGreaterThan(0);
    expect(result.internalOrderId.length).toBeGreaterThan(0);
  });
});

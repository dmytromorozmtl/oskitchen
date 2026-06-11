import { expect, type APIRequestContext, type Page } from "@playwright/test";

import {
  WEBHOOK_INGEST_KITCHEN_IMPORT_TIMEOUT_MS,
  WEBHOOK_INGEST_ORDER_CREATION_FLOW_STEPS,
  type WebhookIngestOrderCreationFlowStep,
} from "@/lib/qa/webhook-ingest-order-creation-e2e-policy";
import { prisma } from "@/lib/prisma";
import { waitForKitchenImport } from "@/services/integrations/woocommerce-live-smoke-service";

import {
  buildE2EWooOrderWebhookPayload,
  postSignedWooOrderWebhook,
  assertWooOrderVisibleOnOrderHub,
} from "./woocommerce-webhook-order-hub-flow";
import { assertStorefrontOrderOnKds } from "./storefront-checkout-kds-flow";
import { resolveWooWebhookOrderHubFixture } from "./woocommerce-webhook-order-hub-ready";

export type WebhookIngestOrderCreationFlowResult = {
  externalOrderId: string;
  internalOrderId: string;
  steps: WebhookIngestOrderCreationFlowStep[];
};

export async function runWebhookIngestOrderCreationFlow(
  request: APIRequestContext,
  page: Page,
): Promise<WebhookIngestOrderCreationFlowResult> {
  const steps: WebhookIngestOrderCreationFlowStep[] = [];
  const fixture = await resolveWooWebhookOrderHubFixture();
  if (!fixture) {
    throw new Error("WooCommerce webhook fixture unavailable");
  }

  const stamp = `e2e${Date.now().toString().slice(-8)}`;
  const payload = buildE2EWooOrderWebhookPayload(stamp);

  await postSignedWooOrderWebhook(request, fixture, payload);
  steps.push("webhook_ingest");

  await assertWooOrderVisibleOnOrderHub(page, stamp, "E2E Woo Guest");
  steps.push("verify_external_order");

  const kitchenImport = await waitForKitchenImport({
    prisma,
    connectionId: fixture.connectionId,
    externalOrderId: stamp,
    timeoutMs: WEBHOOK_INGEST_KITCHEN_IMPORT_TIMEOUT_MS,
  });
  if (!kitchenImport.ok || !kitchenImport.orderId) {
    throw new Error(
      `Kitchen import did not create internal order for externalOrderId=${stamp}`,
    );
  }
  steps.push("verify_kitchen_import");

  await assertStorefrontOrderOnKds(page, kitchenImport.orderId);
  steps.push("verify_kds_ticket");

  if (steps.length !== WEBHOOK_INGEST_ORDER_CREATION_FLOW_STEPS.length) {
    throw new Error(`Flow step mismatch: ${steps.join(" → ")}`);
  }

  expect(kitchenImport.orderId.length).toBeGreaterThan(0);

  return {
    externalOrderId: stamp,
    internalOrderId: kitchenImport.orderId,
    steps,
  };
}

import type { PrismaClient } from "@prisma/client";

import { signShopifyWebhookBody } from "@/lib/integrations/shopify-webhook-order-hub-e2e-policy";
import {
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_SMOKE_SKU,
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_WEBHOOK_TOPIC,
} from "@/lib/integrations/shopify-webhook-kds-e2e-p0-14-policy";
import { verifyShopifyHmac } from "@/services/integrations/shopify";
import { waitForKitchenImport } from "@/services/integrations/shopify-live-smoke-service";
import {
  ensureKitchenTaskForShopifyKdsSmoke,
  ingestShopifyWebhookForSmoke,
} from "@/services/integrations/shopify-webhook-kds-smoke";
import {
  waitForKitchenTaskForOrder,
  waitForWebhookEvent,
} from "@/services/integrations/woocommerce-webhook-kds-smoke";

export type ShopifyWebhookKdsE2EStepStatus = "PASSED" | "FAILED";

export type ShopifyWebhookKdsE2EStep = {
  id: string;
  label: string;
  status: ShopifyWebhookKdsE2EStepStatus;
  detail?: string;
};

export type ShopifyWebhookKdsE2EChainResult = {
  overall: "PASSED" | "FAILED";
  externalOrderId: string;
  webhookEventId: string | null;
  kitchenTaskId: string | null;
  importedOrderId: string | null;
  steps: ShopifyWebhookKdsE2EStep[];
};

export function buildShopifyWebhookKdsE2ETestPayload(
  externalOrderId: string,
): Record<string, unknown> {
  const numericId = Number(externalOrderId);
  return {
    id: Number.isFinite(numericId) ? numericId : externalOrderId,
    name: `#${externalOrderId}`,
    email: `e2e-shopify-kds-${externalOrderId}@example.invalid`,
    phone: "+1555010422",
    currency: "USD",
    subtotal_price: "28.00",
    total_tax: "2.24",
    total_price: "30.24",
    fulfillment_status: null,
    note: "P0-14 Shopify webhook→KDS E2E",
    customer: {
      first_name: "E2E",
      last_name: "Shopify KDS",
    },
    line_items: [
      {
        id: 1,
        title: "E2E KDS Wrap",
        quantity: 1,
        sku: SHOPIFY_WEBHOOK_KDS_E2E_P0_14_SMOKE_SKU,
        price: "28.00",
      },
    ],
  };
}

export async function runShopifyWebhookKdsE2EChain(input: {
  prisma: PrismaClient;
  userId: string;
  workspaceId?: string | null;
  connectionId: string;
  webhookSecret: string;
  externalOrderId?: string;
}): Promise<ShopifyWebhookKdsE2EChainResult> {
  const steps: ShopifyWebhookKdsE2EStep[] = [];
  const externalOrderId =
    input.externalOrderId?.trim() || Date.now().toString().slice(-8);
  const payload = buildShopifyWebhookKdsE2ETestPayload(externalOrderId);
  const rawBody = JSON.stringify(payload);
  const webhookId = `p0-14-${externalOrderId}-${Date.now()}`;

  const hmac = signShopifyWebhookBody(rawBody, input.webhookSecret);
  const hmacOk = verifyShopifyHmac(rawBody, hmac, input.webhookSecret);
  steps.push({
    id: "hmac_self_check",
    label: "HMAC signature self-check",
    status: hmacOk ? "PASSED" : "FAILED",
    detail: hmacOk ? "sha256 HMAC matches webhook secret" : "Local HMAC verify failed",
  });
  if (!hmacOk) {
    return {
      overall: "FAILED",
      externalOrderId,
      webhookEventId: null,
      kitchenTaskId: null,
      importedOrderId: null,
      steps,
    };
  }

  steps.push({
    id: "test_payload",
    label: "Synthetic Shopify order test payload",
    status: "PASSED",
    detail: `externalOrderId=${externalOrderId} sku=${SHOPIFY_WEBHOOK_KDS_E2E_P0_14_SMOKE_SKU}`,
  });

  let webhookEventId: string | null = null;
  try {
    const ingested = await ingestShopifyWebhookForSmoke({
      userId: input.userId,
      workspaceId: input.workspaceId,
      connectionId: input.connectionId,
      topic: SHOPIFY_WEBHOOK_KDS_E2E_P0_14_WEBHOOK_TOPIC,
      payload,
      webhookId,
    });
    webhookEventId = ingested.webhookEventId;
    steps.push({
      id: "webhook_event_persisted",
      label: "WebhookEvent row persisted",
      status: "PASSED",
      detail: `webhookEventId=${ingested.webhookEventId}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    steps.push({
      id: "webhook_event_persisted",
      label: "WebhookEvent row persisted",
      status: "FAILED",
      detail: message.slice(0, 300),
    });
    return {
      overall: "FAILED",
      externalOrderId,
      webhookEventId: null,
      kitchenTaskId: null,
      importedOrderId: null,
      steps,
    };
  }

  const webhookWait = await waitForWebhookEvent({
    prisma: input.prisma,
    connectionId: input.connectionId,
    externalEventId: webhookId,
  });
  if (!webhookWait.ok || webhookWait.processed !== true) {
    steps.push({
      id: "webhook_event_persisted",
      label: "WebhookEvent processed flag",
      status: "FAILED",
      detail: `processed=${String(webhookWait.processed)}`,
    });
    return {
      overall: "FAILED",
      externalOrderId,
      webhookEventId,
      kitchenTaskId: null,
      importedOrderId: null,
      steps,
    };
  }

  const canonicalExternalOrderId = String(payload.id ?? externalOrderId);
  const imported = await waitForKitchenImport({
    prisma: input.prisma,
    connectionId: input.connectionId,
    externalOrderId: canonicalExternalOrderId,
  });
  if (!imported.ok || !imported.orderId) {
    steps.push({
      id: "kds_ticket_visible",
      label: "Kitchen import (order row)",
      status: "FAILED",
      detail: "ExternalOrder.importedOrderId missing after webhook ingest",
    });
    return {
      overall: "FAILED",
      externalOrderId: canonicalExternalOrderId,
      webhookEventId,
      kitchenTaskId: null,
      importedOrderId: null,
      steps,
    };
  }

  const taskWait = await waitForKitchenTaskForOrder({
    prisma: input.prisma,
    orderId: imported.orderId,
  });
  let kitchenTaskId = taskWait.taskId;
  if (!taskWait.ok || !kitchenTaskId) {
    const ensured = await ensureKitchenTaskForShopifyKdsSmoke({
      prisma: input.prisma,
      userId: input.userId,
      workspaceId: input.workspaceId,
      orderId: imported.orderId,
      externalOrderId: canonicalExternalOrderId,
    });
    kitchenTaskId = ensured.taskId;
  }

  steps.push({
    id: "kitchen_task_linked",
    label: "KitchenTask linked to imported order",
    status: kitchenTaskId ? "PASSED" : "FAILED",
    detail: kitchenTaskId
      ? `kitchenTaskId=${kitchenTaskId} relatedOrderId=${imported.orderId}`
      : "No KitchenTask row for imported order",
  });

  steps.push({
    id: "kds_ticket_visible",
    label: "KDS-eligible order imported",
    status: "PASSED",
    detail: `importedOrderId=${imported.orderId}`,
  });

  const failed = steps.some((step) => step.status === "FAILED");
  return {
    overall: failed ? "FAILED" : "PASSED",
    externalOrderId: canonicalExternalOrderId,
    webhookEventId,
    kitchenTaskId,
    importedOrderId: imported.orderId,
    steps,
  };
}

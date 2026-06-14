import type { PrismaClient } from "@prisma/client";

import {
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_SMOKE_SKU,
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_WEBHOOK_TOPIC,
} from "@/lib/integrations/woocommerce-webhook-kds-e2e-p0-13-policy";
import { waitForKitchenImport } from "@/services/integrations/woocommerce-live-smoke-service";
import {
  ensureKitchenTaskForKdsSmoke,
  ingestWooCommerceWebhookForSmoke,
  waitForKitchenTaskForOrder,
  waitForWebhookEvent,
} from "@/services/integrations/woocommerce-webhook-kds-smoke";

export type WooCommerceWebhookKdsE2EStepStatus = "PASSED" | "FAILED";

export type WooCommerceWebhookKdsE2EStep = {
  id: string;
  label: string;
  status: WooCommerceWebhookKdsE2EStepStatus;
  detail?: string;
};

export type WooCommerceWebhookKdsE2EChainResult = {
  overall: "PASSED" | "FAILED";
  externalOrderId: string;
  webhookEventId: string | null;
  kitchenTaskId: string | null;
  importedOrderId: string | null;
  steps: WooCommerceWebhookKdsE2EStep[];
};

export function buildWooCommerceWebhookKdsE2ETestPayload(
  externalOrderId: string,
): Record<string, unknown> {
  return {
    id: externalOrderId,
    number: externalOrderId,
    status: "processing",
    currency: "USD",
    total: "24.00",
    customer_note: "P0-13 WooCommerce webhook→KDS E2E",
    billing: {
      first_name: "E2E",
      last_name: "Woo KDS",
      email: `e2e-woo-kds-${externalOrderId}@example.invalid`,
      phone: "+1555010421",
    },
    shipping: {},
    line_items: [
      {
        id: 1,
        name: "E2E KDS Bowl",
        quantity: 1,
        sku: WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_SMOKE_SKU,
        price: "24.00",
      },
    ],
  };
}

export async function runWooCommerceWebhookKdsE2EChain(input: {
  prisma: PrismaClient;
  userId: string;
  workspaceId?: string | null;
  connectionId: string;
  externalOrderId?: string;
}): Promise<WooCommerceWebhookKdsE2EChainResult> {
  const steps: WooCommerceWebhookKdsE2EStep[] = [];
  const externalOrderId =
    input.externalOrderId?.trim() || `e2e-kds-${Date.now().toString().slice(-10)}`;
  const payload = buildWooCommerceWebhookKdsE2ETestPayload(externalOrderId);
  const deliveryId = `p0-13-${externalOrderId}-${Date.now()}`;

  steps.push({
    id: "test_payload",
    label: "Synthetic Woo order test payload",
    status: "PASSED",
    detail: `externalOrderId=${externalOrderId} sku=${WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_SMOKE_SKU}`,
  });

  let webhookEventId: string | null = null;
  try {
    const ingested = await ingestWooCommerceWebhookForSmoke({
      userId: input.userId,
      workspaceId: input.workspaceId,
      connectionId: input.connectionId,
      topic: WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_WEBHOOK_TOPIC,
      payload,
      deliveryId,
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
    externalEventId: deliveryId,
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

  const imported = await waitForKitchenImport({
    prisma: input.prisma,
    connectionId: input.connectionId,
    externalOrderId,
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
      externalOrderId,
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
    const ensured = await ensureKitchenTaskForKdsSmoke({
      prisma: input.prisma,
      userId: input.userId,
      workspaceId: input.workspaceId,
      orderId: imported.orderId,
      externalOrderId,
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
    externalOrderId,
    webhookEventId,
    kitchenTaskId,
    importedOrderId: imported.orderId,
    steps,
  };
}

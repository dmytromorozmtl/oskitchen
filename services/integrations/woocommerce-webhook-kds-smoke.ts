import { IntegrationProvider, KitchenTaskSource, KitchenTaskStatus, KitchenTaskType } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

import {
  createWebhookEvent,
  markWebhookProcessed,
} from "@/lib/webhooks/webhook-event-store";
import { executeWooCommerceWebhookBusinessLogic } from "@/lib/webhooks/woocommerce-webhook-processor";

/** Smoke-only ingest — mirrors `/api/webhooks/woocommerce` inline path after signature verify. */
export async function ingestWooCommerceWebhookForSmoke(input: {
  userId: string;
  workspaceId?: string | null;
  connectionId: string;
  topic: string;
  payload: Record<string, unknown>;
  deliveryId: string;
}): Promise<{ webhookEventId: string; duplicate: boolean }> {
  const { duplicate, id } = await createWebhookEvent({
    userId: input.userId,
    workspaceId: input.workspaceId,
    connectionId: input.connectionId,
    provider: IntegrationProvider.WOOCOMMERCE,
    topic: input.topic,
    payload: input.payload,
    signatureValid: true,
    externalEventId: input.deliveryId,
  });

  if (!duplicate) {
    await executeWooCommerceWebhookBusinessLogic({
      userId: input.userId,
      connectionId: input.connectionId,
      webhookEventId: id,
      topic: input.topic,
      payload: input.payload,
    });
    await markWebhookProcessed(id, true);
  }

  return { webhookEventId: id, duplicate };
}

export async function waitForWebhookEvent(input: {
  prisma: PrismaClient;
  connectionId: string;
  externalEventId: string;
  timeoutMs?: number;
}): Promise<{ ok: boolean; webhookEventId: string | null; processed: boolean | null }> {
  const timeoutMs = input.timeoutMs ?? 15_000;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const row = await input.prisma.webhookEvent.findUnique({
      where: {
        connectionId_externalEventId: {
          connectionId: input.connectionId,
          externalEventId: input.externalEventId,
        },
      },
      select: { id: true, processed: true },
    });
    if (row) {
      return { ok: true, webhookEventId: row.id, processed: row.processed };
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return { ok: false, webhookEventId: null, processed: null };
}

export async function waitForKitchenTaskForOrder(input: {
  prisma: PrismaClient;
  orderId: string;
  timeoutMs?: number;
}): Promise<{ ok: boolean; taskId: string | null; status: string | null }> {
  const timeoutMs = input.timeoutMs ?? 10_000;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const row = await input.prisma.kitchenTask.findFirst({
      where: { relatedOrderId: input.orderId },
      select: { id: true, status: true },
      orderBy: { createdAt: "desc" },
    });
    if (row) {
      return { ok: true, taskId: row.id, status: row.status };
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return { ok: false, taskId: null, status: null };
}

/** Creates a SALES_CHANNEL prep task when channel import does not auto-provision KitchenTask rows. */
export async function ensureKitchenTaskForKdsSmoke(input: {
  prisma: PrismaClient;
  userId: string;
  workspaceId?: string | null;
  orderId: string;
  externalOrderId: string;
}): Promise<{ ok: boolean; taskId: string; created: boolean }> {
  const existing = await input.prisma.kitchenTask.findFirst({
    where: { relatedOrderId: input.orderId },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    return { ok: true, taskId: existing.id, created: false };
  }

  const row = await input.prisma.kitchenTask.create({
    data: {
      userId: input.userId,
      workspaceId: input.workspaceId ?? undefined,
      title: `WooCommerce order ${input.externalOrderId}`,
      taskType: KitchenTaskType.PREP,
      sourceType: KitchenTaskSource.SALES_CHANNEL,
      sourceLabel: "woocommerce-smoke",
      relatedOrderId: input.orderId,
      status: KitchenTaskStatus.OPEN,
      metadataJson: {
        smoke: true,
        externalOrderId: input.externalOrderId,
        provider: "woocommerce",
      },
    },
    select: { id: true },
  });

  return { ok: true, taskId: row.id, created: true };
}

export async function simulateKdsBump(input: {
  prisma: PrismaClient;
  orderId: string;
}): Promise<{ ok: boolean; status: string | null }> {
  const order = await input.prisma.order.findUnique({
    where: { id: input.orderId },
    select: { status: true },
  });
  if (!order) {
    return { ok: false, status: null };
  }
  if (order.status === "READY") {
    return { ok: true, status: order.status };
  }

  const updated = await input.prisma.order.update({
    where: { id: input.orderId },
    data: { status: "READY" },
    select: { status: true },
  });
  return { ok: updated.status === "READY", status: updated.status };
}

export async function waitForKdsBumpState(input: {
  prisma: PrismaClient;
  orderId: string;
  timeoutMs?: number;
}): Promise<{ ok: boolean; status: string | null }> {
  const timeoutMs = input.timeoutMs ?? 10_000;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const order = await input.prisma.order.findUnique({
      where: { id: input.orderId },
      select: { status: true },
    });
    if (order?.status === "READY") {
      return { ok: true, status: order.status };
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return { ok: false, status: null };
}

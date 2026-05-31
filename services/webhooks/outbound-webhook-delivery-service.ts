import { randomUUID } from "crypto";

import {
  OutboundWebhookDeliveryStatus,
  type Prisma,
} from "@prisma/client";

import { decryptSecret } from "@/lib/crypto";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { resolveOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";
import type { OutboundWebhookEventType } from "@/lib/webhooks/outbound-webhook-events";
import { outboundWebhookHeaders } from "@/lib/webhooks/outbound-webhook-events";
import {
  buildOutboundWebhookRequestHeaders,
  truncateResponseSnippet,
} from "@/lib/webhooks/outbound-webhook-signing";
import type { OutboundWebhookEnvelope } from "@/services/webhooks/outbound-webhook-payload-builders";
import { serializeOutboundWebhookEnvelope } from "@/services/webhooks/outbound-webhook-payload-builders";
import { webhookRetryDelayMs } from "@/services/webhooks/webhook-retry-service";

const STALE_DELIVERY_LOCK_MS = 2 * 60 * 1000;
const DELIVERY_FETCH_TIMEOUT_MS = 15_000;

export type OutboundWebhookDeliveryView = {
  id: string;
  subscriptionId: string;
  eventType: string;
  status: OutboundWebhookDeliveryStatus;
  attemptCount: number;
  httpStatus: number | null;
  lastError: string | null;
  deliveredAt: Date | null;
  createdAt: Date;
};

export async function listRecentOutboundWebhookDeliveries(
  ownerUserId: string,
  limit = 50,
): Promise<OutboundWebhookDeliveryView[]> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  const rows = await prisma.outboundWebhookDelivery.findMany({
    where: scope as Prisma.OutboundWebhookDeliveryWhereInput,
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      subscriptionId: true,
      eventType: true,
      status: true,
      attemptCount: true,
      httpStatus: true,
      lastError: true,
      deliveredAt: true,
      createdAt: true,
    },
  });
  return rows;
}

export async function queueOutboundWebhookDeliveries(input: {
  ownerUserId: string;
  workspaceId: string | null;
  eventType: OutboundWebhookEventType;
  buildEnvelope: (deliveryId: string) => OutboundWebhookEnvelope;
}): Promise<number> {
  const scope = await resolveOwnerScopedWhere(input.ownerUserId);
  const subscriptions = await prisma.outboundWebhookSubscription.findMany({
    where: {
      AND: [
        scope as Prisma.OutboundWebhookSubscriptionWhereInput,
        { active: true },
        { events: { has: input.eventType } },
      ],
    },
    select: { id: true },
  });

  if (subscriptions.length === 0) return 0;

  const deliveries = subscriptions.map((sub) => {
    const deliveryId = randomUUID();
    const envelope = input.buildEnvelope(deliveryId);
    return {
      id: deliveryId,
      subscriptionId: sub.id,
      userId: input.ownerUserId,
      workspaceId: input.workspaceId,
      eventType: input.eventType,
      payloadJson: envelope as unknown as Prisma.InputJsonValue,
      status: OutboundWebhookDeliveryStatus.QUEUED,
      nextAttemptAt: new Date(),
    };
  });

  await prisma.outboundWebhookDelivery.createMany({ data: deliveries });

  await Promise.all(
    deliveries.slice(0, 3).map((delivery) => attemptOutboundWebhookDelivery(delivery.id)),
  );

  return deliveries.length;
}

export function emitOutboundWebhookEvent(input: {
  ownerUserId: string;
  workspaceId?: string | null;
  eventType: OutboundWebhookEventType;
  buildEnvelope: (deliveryId: string) => OutboundWebhookEnvelope;
}): void {
  void queueOutboundWebhookDeliveries({
    ownerUserId: input.ownerUserId,
    workspaceId: input.workspaceId ?? null,
    eventType: input.eventType,
    buildEnvelope: input.buildEnvelope,
  }).catch((error) => {
    logger.warn("outbound_webhook_emit_failed", {
      eventType: input.eventType,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

export async function sendOutboundWebhookTestPing(input: {
  ownerUserId: string;
  subscriptionId: string;
}): Promise<{ ok: true; deliveryId: string } | { ok: false; error: string }> {
  const scope = await resolveOwnerScopedWhere(input.ownerUserId);
  const subscription = await prisma.outboundWebhookSubscription.findFirst({
    where: { AND: [scope as Prisma.OutboundWebhookSubscriptionWhereInput, { id: input.subscriptionId }] },
  });
  if (!subscription) return { ok: false, error: "Subscription not found." };

  const deliveryId = randomUUID();
  const envelope: OutboundWebhookEnvelope = {
    id: deliveryId,
    type: "order.created",
    createdAt: new Date().toISOString(),
    workspaceId: subscription.workspaceId,
    data: {
      test: true,
      message: "KitchenOS outbound webhook test ping",
      subscriptionId: subscription.id,
    },
  };

  await prisma.outboundWebhookDelivery.create({
    data: {
      id: deliveryId,
      subscriptionId: subscription.id,
      userId: input.ownerUserId,
      workspaceId: subscription.workspaceId,
      eventType: "ping.test",
      payloadJson: envelope as unknown as Prisma.InputJsonValue,
      status: OutboundWebhookDeliveryStatus.QUEUED,
      nextAttemptAt: new Date(),
    },
  });

  const result = await attemptOutboundWebhookDelivery(deliveryId);
  if (!result.ok) {
    return { ok: false, error: result.error ?? "Delivery failed." };
  }
  return { ok: true, deliveryId };
}

export async function attemptOutboundWebhookDelivery(
  deliveryId: string,
): Promise<{ ok: boolean; error?: string }> {
  const delivery = await prisma.outboundWebhookDelivery.findUnique({
    where: { id: deliveryId },
    include: { subscription: true },
  });
  if (!delivery || !delivery.subscription.active) {
    return { ok: false, error: "Delivery or subscription not found." };
  }
  if (
    delivery.status === OutboundWebhookDeliveryStatus.SUCCEEDED ||
    delivery.status === OutboundWebhookDeliveryStatus.DEAD
  ) {
    return { ok: delivery.status === OutboundWebhookDeliveryStatus.SUCCEEDED };
  }

  const locked = await prisma.outboundWebhookDelivery.updateMany({
    where: {
      id: deliveryId,
      status: { in: [OutboundWebhookDeliveryStatus.QUEUED, OutboundWebhookDeliveryStatus.FAILED] },
    },
    data: {
      status: OutboundWebhookDeliveryStatus.DELIVERING,
      attemptCount: { increment: 1 },
    },
  });
  if (locked.count === 0) {
    return { ok: false, error: "Delivery already in progress." };
  }

  let secret: string;
  try {
    secret = decryptSecret(delivery.subscription.secretEncrypted);
  } catch {
    await markOutboundDeliveryFailed(delivery.id, delivery.subscription.id, {
      lastError: "Unable to decrypt subscription secret.",
      dead: true,
    });
    return { ok: false, error: "Unable to decrypt subscription secret." };
  }

  const rawBody = serializeOutboundWebhookEnvelope(
    delivery.payloadJson as unknown as OutboundWebhookEnvelope,
  );
  const maxBytes = outboundWebhookHeaders().maxPayloadBytes;
  if (Buffer.byteLength(rawBody, "utf8") > maxBytes) {
    await markOutboundDeliveryFailed(delivery.id, delivery.subscription.id, {
      lastError: `Payload exceeds ${maxBytes} bytes.`,
      dead: true,
    });
    return { ok: false, error: "Payload too large." };
  }

  const headers = buildOutboundWebhookRequestHeaders({
    secret,
    eventType: delivery.eventType,
    deliveryId: delivery.id,
    rawBody,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DELIVERY_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(delivery.subscription.url, {
      method: "POST",
      headers,
      body: rawBody,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const responseText = await response.text().catch(() => "");
    const snippet = truncateResponseSnippet(responseText);

    if (response.ok) {
      await prisma.$transaction([
        prisma.outboundWebhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: OutboundWebhookDeliveryStatus.SUCCEEDED,
            httpStatus: response.status,
            responseSnippet: snippet,
            deliveredAt: new Date(),
            lastError: null,
            nextAttemptAt: null,
          },
        }),
        prisma.outboundWebhookSubscription.update({
          where: { id: delivery.subscription.id },
          data: {
            lastDeliveryAt: new Date(),
            lastSuccessAt: new Date(),
            consecutiveFailures: 0,
          },
        }),
      ]);
      return { ok: true };
    }

    const attemptCount = delivery.attemptCount + 1;
    const dead = attemptCount >= delivery.maxAttempts;
    const delay = webhookRetryDelayMs(attemptCount);
    await markOutboundDeliveryFailed(delivery.id, delivery.subscription.id, {
      httpStatus: response.status,
      responseSnippet: snippet,
      lastError: `HTTP ${response.status}`,
      dead,
      nextAttemptAt: dead ? null : new Date(Date.now() + delay),
    });
    return { ok: false, error: `HTTP ${response.status}` };
  } catch (error) {
    clearTimeout(timeout);
    const message = error instanceof Error ? error.message : "Delivery request failed.";
    const attemptCount = delivery.attemptCount + 1;
    const dead = attemptCount >= delivery.maxAttempts;
    const delay = webhookRetryDelayMs(attemptCount);
    await markOutboundDeliveryFailed(delivery.id, delivery.subscription.id, {
      lastError: message,
      dead,
      nextAttemptAt: dead ? null : new Date(Date.now() + delay),
    });
    return { ok: false, error: message };
  }
}

async function markOutboundDeliveryFailed(
  deliveryId: string,
  subscriptionId: string,
  input: {
    httpStatus?: number;
    responseSnippet?: string;
    lastError: string;
    dead?: boolean;
    nextAttemptAt?: Date | null;
  },
): Promise<void> {
  await prisma.$transaction([
    prisma.outboundWebhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: input.dead
          ? OutboundWebhookDeliveryStatus.DEAD
          : OutboundWebhookDeliveryStatus.FAILED,
        httpStatus: input.httpStatus ?? null,
        responseSnippet: input.responseSnippet ?? null,
        lastError: input.lastError,
        nextAttemptAt: input.nextAttemptAt ?? null,
      },
    }),
    prisma.outboundWebhookSubscription.update({
      where: { id: subscriptionId },
      data: {
        lastDeliveryAt: new Date(),
        lastFailureAt: new Date(),
        consecutiveFailures: { increment: 1 },
      },
    }),
  ]);
}

export type OutboundWebhookDrainStats = {
  attempted: number;
  succeeded: number;
  rescheduled: number;
  failed: number;
  skipped: number;
};

export async function drainOutboundWebhookDeliveries(batchSize = 25): Promise<OutboundWebhookDrainStats> {
  const stats: OutboundWebhookDrainStats = {
    attempted: 0,
    succeeded: 0,
    rescheduled: 0,
    failed: 0,
    skipped: 0,
  };

  const staleBefore = new Date(Date.now() - STALE_DELIVERY_LOCK_MS);
  await prisma.outboundWebhookDelivery.updateMany({
    where: {
      status: OutboundWebhookDeliveryStatus.DELIVERING,
      updatedAt: { lt: staleBefore },
    },
    data: { status: OutboundWebhookDeliveryStatus.FAILED },
  });

  const due = await prisma.outboundWebhookDelivery.findMany({
    where: {
      status: { in: [OutboundWebhookDeliveryStatus.QUEUED, OutboundWebhookDeliveryStatus.FAILED] },
      OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: new Date() } }],
    },
    orderBy: { createdAt: "asc" },
    take: batchSize,
    select: { id: true },
  });

  for (const row of due) {
    stats.attempted += 1;
    const result = await attemptOutboundWebhookDelivery(row.id);
    if (result.ok) {
      stats.succeeded += 1;
    } else {
      const refreshed = await prisma.outboundWebhookDelivery.findUnique({
        where: { id: row.id },
        select: { status: true },
      });
      if (refreshed?.status === OutboundWebhookDeliveryStatus.DEAD) {
        stats.failed += 1;
      } else if (refreshed?.status === OutboundWebhookDeliveryStatus.FAILED) {
        stats.rescheduled += 1;
      } else {
        stats.skipped += 1;
      }
    }
  }

  return stats;
}

import { Prisma } from "@prisma/client";
import type { IntegrationProvider } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { webhookProcessingKey } from "@/lib/idempotency/idempotency-keys";

/** Logical idempotency key for inbound webhook deliveries (mirrors DB unique scope). */
export function resolveWebhookProcessingIdempotencyKey(input: {
  provider: IntegrationProvider;
  externalEventId?: string | null;
  connectionId?: string | null;
}): string | null {
  const externalEventId = input.externalEventId?.trim();
  if (!externalEventId) return null;
  return webhookProcessingKey({
    provider: input.provider,
    externalEventId,
    connectionId: input.connectionId,
  });
}

export async function createWebhookEvent(input: {
  userId: string;
  workspaceId?: string | null;
  connectionId?: string | null;
  provider: IntegrationProvider;
  topic: string;
  payload: unknown;
  signatureValid: boolean;
  externalEventId?: string | null;
}): Promise<{ duplicate: boolean; id: string }> {
  const payloadJson = input.payload as Prisma.InputJsonValue;
  const connectionId = input.connectionId?.trim() || null;
  const externalEventId = input.externalEventId?.trim() || null;
  resolveWebhookProcessingIdempotencyKey({
    provider: input.provider,
    externalEventId,
    connectionId,
  });

  if (connectionId && externalEventId) {
    const existing = await prisma.webhookEvent.findUnique({
      where: {
        connectionId_externalEventId: {
          connectionId,
          externalEventId,
        },
      },
      select: { id: true },
    });
    if (existing) return { duplicate: true, id: existing.id };

    try {
      const row = await prisma.webhookEvent.create({
        data: {
          userId: input.userId,
          workspaceId: input.workspaceId ?? undefined,
          connectionId,
          provider: input.provider,
          topic: input.topic,
          payloadJson,
          signatureValid: input.signatureValid,
          externalEventId,
          processed: false,
        },
      });
      return { duplicate: false, id: row.id };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        const dup = await prisma.webhookEvent.findUnique({
          where: {
            connectionId_externalEventId: { connectionId, externalEventId },
          },
          select: { id: true },
        });
        if (dup) return { duplicate: true, id: dup.id };
      }
      throw e;
    }
  }

  if (externalEventId) {
    const dup = await prisma.webhookEvent.findFirst({
      where: {
        userId: input.userId,
        provider: input.provider,
        externalEventId,
      },
      select: { id: true },
    });
    if (dup) return { duplicate: true, id: dup.id };
  }

  const row = await prisma.webhookEvent.create({
    data: {
      userId: input.userId,
      workspaceId: input.workspaceId ?? undefined,
      connectionId: connectionId ?? undefined,
      provider: input.provider,
      topic: input.topic,
      payloadJson,
      signatureValid: input.signatureValid,
      externalEventId: externalEventId ?? undefined,
      processed: false,
    },
  });
  return { duplicate: false, id: row.id };
}

export async function markWebhookProcessed(
  id: string,
  ok: boolean,
  error?: string | null,
) {
  await prisma.webhookEvent.update({
    where: { id },
    data: {
      processed: ok,
      processingError: ok ? null : (error ?? "Unknown error"),
      processedAt: new Date(),
    },
  });
}

import { createHash } from "node:crypto";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const WEBHOOK_INGRESS_ROUTE_KEYS = {
  UBER_DIRECT: "uber-direct",
  SLACK_EXPERIMENT_INTERACTIVE: "slack/experiment-interactive",
} as const;

export type WebhookIngressRouteKey =
  (typeof WEBHOOK_INGRESS_ROUTE_KEYS)[keyof typeof WEBHOOK_INGRESS_ROUTE_KEYS];

export function hashWebhookIngressBody(rawBody: string): string {
  return createHash("sha256").update(rawBody, "utf8").digest("hex");
}

export function extractUberDirectExternalEventId(payload: unknown, rawBody: string): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const eventId = record.event_id ?? record.id;
    if (typeof eventId === "string" && eventId.trim()) {
      return eventId.trim();
    }
  }
  return `body:${hashWebhookIngressBody(rawBody)}`;
}

export function extractSlackInteractiveExternalEventId(payload: {
  trigger_id?: string;
  callback_id?: string;
  user?: { id?: string };
  actions?: { action_id?: string; value?: string }[];
} | null): string | null {
  if (!payload) return null;
  if (payload.trigger_id?.trim()) {
    return payload.trigger_id.trim();
  }
  const action = payload.actions?.[0];
  if (action?.action_id && payload.user?.id) {
    return `${payload.user.id}:${action.action_id}:${action.value ?? ""}`;
  }
  if (payload.callback_id?.trim()) {
    return payload.callback_id.trim();
  }
  return null;
}

export async function recordWebhookIngressOrDuplicate(input: {
  routeKey: WebhookIngressRouteKey;
  externalEventId: string;
}): Promise<{ duplicate: boolean }> {
  const externalEventId = input.externalEventId.trim();
  if (!externalEventId) {
    return { duplicate: false };
  }

  try {
    await prisma.webhookIngressDedupe.create({
      data: {
        routeKey: input.routeKey,
        externalEventId,
      },
    });
    return { duplicate: false };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { duplicate: true };
    }
    throw error;
  }
}

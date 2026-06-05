import { IntegrationProvider } from "@prisma/client";

import { persistNormalizedExternalOrder } from "@/lib/integrations/persist-external-order";
import { createWebhookEvent, markWebhookProcessed } from "@/lib/webhooks/webhook-event-store";
import { normalizeUberEatsOrder } from "@/services/integrations/uber-eats";
import { importUberEatsOrderToKitchen } from "@/services/integrations/uber-eats/kitchen-import.service";

export type UberEatsInboundResult = {
  ok: boolean;
  duplicate?: boolean;
  externalOrderId?: string;
  importedOrderId?: string;
  message?: string;
};

/**
 * Idempotent inbound Uber Eats order webhook → external_orders (+ optional kitchen import).
 * Prefer the HTTP route (`app/api/webhooks/uber-eats/orders`) which also verifies signatures.
 */
export async function processUberEatsInboundOrder(input: {
  userId: string;
  workspaceId?: string | null;
  connectionId: string;
  externalEventId: string;
  payload: Record<string, unknown>;
  webhookEventId?: string;
}): Promise<UberEatsInboundResult> {
  let eventId = input.webhookEventId;

  if (!eventId) {
    const event = await createWebhookEvent({
      userId: input.userId,
      workspaceId: input.workspaceId,
      connectionId: input.connectionId,
      provider: IntegrationProvider.UBER_EATS,
      topic: "orders",
      payload: input.payload,
      signatureValid: true,
      externalEventId: input.externalEventId,
    });

    if (event.duplicate) {
      return { ok: true, duplicate: true, message: "Duplicate webhook event" };
    }
    eventId = event.id;
  }

  try {
    const normalized = normalizeUberEatsOrder(input.payload);
    const external = await persistNormalizedExternalOrder({
      userId: input.userId,
      connectionId: input.connectionId,
      normalized,
    });

    const kitchen = await importUberEatsOrderToKitchen({
      userId: input.userId,
      workspaceId: input.workspaceId,
      connectionId: input.connectionId,
      normalized,
      externalOrderRecordId: external.id,
    });

    await markWebhookProcessed(eventId, true);
    return {
      ok: true,
      externalOrderId: normalized.externalOrderId,
      importedOrderId: kitchen.orderId,
      message: kitchen.imported
        ? "External order persisted and imported to kitchen"
        : kitchen.duplicate
          ? "External order persisted (kitchen import already done)"
          : "External order persisted",
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await markWebhookProcessed(eventId, false, msg);
    return { ok: false, message: msg };
  }
}
